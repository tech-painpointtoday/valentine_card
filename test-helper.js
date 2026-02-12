/**
 * Test Helper Script for Valentine Card Maker
 * 
 * This script helps you create a demo card for testing the receiver flow
 * without needing to go through the full card creation process.
 * 
 * HOW TO USE:
 * 1. Open the app in your browser
 * 2. Open browser DevTools console (F12)
 * 3. Copy and paste this entire script into the console
 * 4. Run: await createDemoCard()
 * 5. Visit the URL that's logged to test the receiver flow
 */

async function createDemoCard() {
  const API_BASE = window.location.origin;
  
  // Generate a unique card ID
  const cardId = 'demo-' + Math.random().toString(36).substring(2, 15);
  
  // Demo card data with external image URLs
  const demoCard = {
    cardId: cardId,
    senderImage: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=800',
    message: 'Happy Valentine\'s Day! 💖\n\nYou mean the world to me. Thank you for being so amazing and for all the wonderful moments we\'ve shared together.\n\nWith all my love,\nYour Valentine',
    gifts: [
      {
        id: '1',
        name: 'Chocolate Box',
        image: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=400'
      },
      {
        id: '2',
        name: 'Red Roses',
        image: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=400'
      },
      {
        id: '3',
        name: 'Teddy Bear',
        image: 'https://images.unsplash.com/photo-1560472355-109703aa3edc?w=400'
      },
      {
        id: '4',
        name: 'Heart Balloons',
        image: 'https://images.unsplash.com/photo-1609681864755-e84c1707717c?w=400'
      }
    ]
  };
  
  try {
    // Get Supabase credentials from the page
    const { projectId, publicAnonKey } = await import('/utils/supabase/info');
    const apiUrl = `https://${projectId}.supabase.co/functions/v1/make-server-3a715eba/cards`;
    
    console.log('Creating demo card...');
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`
      },
      body: JSON.stringify(demoCard)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create demo card: ${response.statusText}`);
    }
    
    const result = await response.json();
    const cardUrl = `${API_BASE}/card/${cardId}`;
    
    console.log('✅ Demo card created successfully!');
    console.log('📋 Card URL:', cardUrl);
    console.log('\n🎯 Test the receiver flow:');
    console.log(`1. Visit: ${cardUrl}`);
    console.log('2. Try clicking "No thanks" (it will run away!)');
    console.log('3. Click "Open Card" to see the 3D flip animation');
    console.log('4. Choose a gift');
    console.log('5. See the summary and try downloading/sharing');
    
    // Optionally copy to clipboard
    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(cardUrl);
        console.log('\n📋 URL copied to clipboard!');
      } catch (e) {
        // Clipboard copy failed, but that's okay
      }
    }
    
    return cardUrl;
  } catch (error) {
    console.error('❌ Error creating demo card:', error);
    console.log('\nNote: Make sure you\'re on the app page when running this script.');
    throw error;
  }
}

// Export for easy access
window.createDemoCard = createDemoCard;

console.log('🎨 Valentine Card Maker - Test Helper Loaded!');
console.log('Run: await createDemoCard()');
