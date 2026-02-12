import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import { createClient } from "npm:@supabase/supabase-js@2";

const app = new Hono();

// Initialize Supabase client with service role key
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

// Create storage bucket on startup
const BUCKET_NAME = 'make-3a715eba-valentine-cards';
(async () => {
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === BUCKET_NAME);
    if (!bucketExists) {
      await supabase.storage.createBucket(BUCKET_NAME, {
        public: false,
        fileSizeLimit: 5242880, // 5MB
      });
      console.log(`Created storage bucket: ${BUCKET_NAME}`);
    }
  } catch (error) {
    console.error('Error creating storage bucket:', error);
  }
})();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-3a715eba/health", (c) => {
  return c.json({ status: "ok" });
});

// Create a new Valentine card
app.post("/make-server-3a715eba/cards", async (c) => {
  try {
    const { cardId, senderImage, message, gifts } = await c.req.json();
    
    if (!cardId || !senderImage || !message || !gifts || !Array.isArray(gifts)) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    const cardData = {
      cardId,
      senderImage,
      message,
      gifts,
      createdAt: Date.now(),
    };

    await kv.set(`card:${cardId}`, cardData);
    console.log(`Created card: ${cardId}`);
    
    return c.json({ success: true, cardId });
  } catch (error) {
    console.error('Error creating card:', error);
    return c.json({ error: 'Failed to create card', details: String(error) }, 500);
  }
});

// Get a Valentine card by ID
app.get("/make-server-3a715eba/cards/:cardId", async (c) => {
  try {
    const cardId = c.req.param('cardId');
    const cardData = await kv.get(`card:${cardId}`);
    
    if (!cardData) {
      return c.json({ error: 'Card not found' }, 404);
    }

    // Get signed URL for sender image if it's stored in Supabase
    if (cardData.senderImage && cardData.senderImage.startsWith('storage/')) {
      const filePath = cardData.senderImage.replace('storage/', '');
      const { data: signedUrlData } = await supabase.storage
        .from(BUCKET_NAME)
        .createSignedUrl(filePath, 3600); // 1 hour expiry
      
      if (signedUrlData) {
        cardData.senderImage = signedUrlData.signedUrl;
      }
    }

    // Get signed URLs for gift images if they're stored in Supabase
    if (cardData.gifts && Array.isArray(cardData.gifts)) {
      cardData.gifts = await Promise.all(
        cardData.gifts.map(async (gift: any) => {
          if (gift.image && gift.image.startsWith('storage/')) {
            const filePath = gift.image.replace('storage/', '');
            const { data: signedUrlData } = await supabase.storage
              .from(BUCKET_NAME)
              .createSignedUrl(filePath, 3600); // 1 hour expiry
            
            if (signedUrlData) {
              return { ...gift, image: signedUrlData.signedUrl };
            }
          }
          return gift;
        })
      );
    }

    return c.json(cardData);
  } catch (error) {
    console.error('Error getting card:', error);
    return c.json({ error: 'Failed to get card', details: String(error) }, 500);
  }
});

// Update receiver's gift choice
app.put("/make-server-3a715eba/cards/:cardId/choice", async (c) => {
  try {
    const cardId = c.req.param('cardId');
    const { receiverChoice } = await c.req.json();
    
    if (!receiverChoice) {
      return c.json({ error: 'Missing receiverChoice' }, 400);
    }

    const cardData = await kv.get(`card:${cardId}`);
    
    if (!cardData) {
      return c.json({ error: 'Card not found' }, 404);
    }

    cardData.receiverChoice = receiverChoice;
    await kv.set(`card:${cardId}`, cardData);
    console.log(`Updated choice for card ${cardId}: ${receiverChoice}`);
    
    return c.json({ success: true });
  } catch (error) {
    console.error('Error updating choice:', error);
    return c.json({ error: 'Failed to update choice', details: String(error) }, 500);
  }
});

// Upload an image to Supabase Storage
app.post("/make-server-3a715eba/upload", async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return c.json({ error: 'No file provided' }, 400);
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 15);
    const ext = file.name.split('.').pop();
    const filename = `${timestamp}-${randomStr}.${ext}`;

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filename, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.error('Supabase upload error:', error);
      return c.json({ error: 'Upload failed', details: error.message }, 500);
    }

    console.log(`Uploaded file: ${filename}`);
    
    // Return storage path (will be converted to signed URL when retrieved)
    return c.json({ 
      success: true, 
      path: `storage/${data.path}` 
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return c.json({ error: 'Failed to upload file', details: String(error) }, 500);
  }
});

Deno.serve(app.fetch);