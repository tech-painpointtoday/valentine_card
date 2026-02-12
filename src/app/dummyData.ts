// Dummy data for testing
// You can use this to pre-populate localStorage for testing

export const dummyCard = {
  cardId: 'demo123',
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
  ],
  createdAt: Date.now()
};

// To use this dummy data, run this in browser console:
// localStorage.setItem('valentine_cards', JSON.stringify({ 'demo123': dummyCard }))
// Then visit: /card/demo123
