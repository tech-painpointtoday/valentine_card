export interface Gift {
  id: string;
  name: string;
  image: string;
}

export interface ValentineCard {
  cardId: string;
  senderImage: string;
  message: string;
  gifts: Gift[];
  receiverChoice?: string;
  createdAt: number;
}
