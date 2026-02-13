<?php
// Get the request URI
$requestUri = $_SERVER['REQUEST_URI'];

// Check if this is a card URL
$isCardUrl = preg_match('#/card/[a-zA-Z0-9]+#', $requestUri);

// Read the compiled index.html (it's in the same directory as this PHP file)
$indexPath = __DIR__ . '/index.html';

if (!file_exists($indexPath)) {
    // Error handling - if index.html is not found
    http_response_code(500);
    die("Error: index.html not found at: " . $indexPath);
}

$html = file_get_contents($indexPath);

if ($html === false) {
    http_response_code(500);
    die("Error: Could not read index.html");
}

if ($isCardUrl) {
    // Replace meta tags for card URLs
    $title = 'เธอได้รับการ์ดวาเลนไทน์นะ 💖';
    $description = 'มีคนส่งเซอร์ไพรส์มาให้เธอด้วยแหละ... ลองเปิดดูนะ';
    $ogImage = 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=1200&h=630&fit=crop';
    $currentUrl = 'https://' . $_SERVER['HTTP_HOST'] . $requestUri;
    
    // Replace title
    $html = preg_replace(
        '/<title>.*?<\/title>/s',
        '<title>' . htmlspecialchars($title, ENT_QUOTES, 'UTF-8') . '</title>',
        $html
    );
    
    // Replace og:title
    $html = preg_replace(
        '/<meta property="og:title" content="[^"]*" \/>/i',
        '<meta property="og:title" content="' . htmlspecialchars($title, ENT_QUOTES, 'UTF-8') . '" />',
        $html
    );
    
    // Replace og:description
    $html = preg_replace(
        '/<meta property="og:description" content="[^"]*" \/>/i',
        '<meta property="og:description" content="' . htmlspecialchars($description, ENT_QUOTES, 'UTF-8') . '" />',
        $html
    );
    
    // Replace og:url
    $html = preg_replace(
        '/<meta property="og:url" content="[^"]*" \/>/i',
        '<meta property="og:url" content="' . htmlspecialchars($currentUrl, ENT_QUOTES, 'UTF-8') . '" />',
        $html
    );
    
    // Replace og:image
    $html = preg_replace(
        '/<meta property="og:image" content="[^"]*" \/>/i',
        '<meta property="og:image" content="' . htmlspecialchars($ogImage, ENT_QUOTES, 'UTF-8') . '" />',
        $html
    );
    
    // Replace twitter:image
    $html = preg_replace(
        '/<meta name="twitter:image" content="[^"]*" \/>/i',
        '<meta name="twitter:image" content="' . htmlspecialchars($ogImage, ENT_QUOTES, 'UTF-8') . '" />',
        $html
    );
    
    // Replace twitter:title
    $html = preg_replace(
        '/<meta name="twitter:title" content="[^"]*" \/>/i',
        '<meta name="twitter:title" content="' . htmlspecialchars($title, ENT_QUOTES, 'UTF-8') . '" />',
        $html
    );
    
    // Replace twitter:description
    $html = preg_replace(
        '/<meta name="twitter:description" content="[^"]*" \/>/i',
        '<meta name="twitter:description" content="' . htmlspecialchars($description, ENT_QUOTES, 'UTF-8') . '" />',
        $html
    );
    
    // Replace meta description
    $html = preg_replace(
        '/<meta name="description" content="[^"]*" \/>/i',
        '<meta name="description" content="' . htmlspecialchars($description, ENT_QUOTES, 'UTF-8') . '" />',
        $html
    );
    
    // Change lang attribute
    $html = preg_replace(
        '/<html([^>]*) lang="[^"]*"/i',
        '<html$1 lang="th"',
        $html
    );
}

// Output the modified HTML
header('Content-Type: text/html; charset=UTF-8');
echo $html;
?>