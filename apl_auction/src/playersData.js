// src/playersData.js

const realPlayers = [
  { id: 1, name: 'Nimna Malshan ', role: 'Batsman' },
  { id: 4, name: 'Akindu Boshika', role: 'Batsman' },
  { id: 5, name: 'Nadeesh Sasmitha', role: 'Batsman' },
  { id: 6, name: 'Naveen', role: 'Batsman' },
  { id: 7, name: 'Nimantha Gihan', role: 'Batsman' },
  { id: 8, name: 'Chathuranga Basnayaka', role: 'Batsman' },
  { id: 9, name: 'Prabash Rathnayaka', role: 'Batsman' },
  { id: 11, name: 'Nadeeja Dilum', role: 'Batsman' },
  { id: 12, name: 'Sandun', role: 'Batsman' },
  { id: 13, name: 'Supun Buddika', role: 'Batsman' },
  { id: 15, name: 'Chinthana Prasad', role: 'All-Rounder' },
  { id: 16, name: 'Dhanushka Mahesh', role: 'All-Rounder' },
  { id: 17, name: 'Pasindu Kalanitha', role: 'All-Rounder' },
  { id: 19, name: 'Muditha Ashen', role: 'All-Rounder' },
  { id: 20, name: 'Thineth Ayodhya', role: 'All-Rounder' },
  { id: 21, name: 'Chamin Thishakya', role: 'All-Rounder' },
  { id: 22, name: 'Damiyuth Shashmika', role: 'All-Rounder' },
  { id: 25, name: 'Gayan Rathnayaka', role: 'All-Rounder' },
  { id: 26, name: 'Ravindu Madushan', role: 'All-Rounder' },
  { id: 28, name: 'Sandun Lakshantha', role: 'All-Rounder' },
  { id: 29, name: 'Ananda Bakmeewewa', role: 'All-Rounder' },
  { id: 30, name: 'Suresh Dissanayake', role: 'All-Rounder' },
  { id: 31, name: 'Kaushika Chamesh', role: 'All-Rounder' },
  { id: 32, name: 'Dhanaja Lushan', role: 'All-Rounder' },
  { id: 34, name: 'Mahesh Chathuranga', role: 'All-Rounder' },
  { id: 35, name: 'Saranga Dimuth', role: 'All-Rounder' },
  { id: 36, name: 'Sineth Deshan', role: 'All-Rounder' },
  { id: 37, name: 'Sanjana Kariyawasam', role: 'All-Rounder' },
  { id: 38, name: 'Eranda Imalka', role: 'All-Rounder' },
  { id: 39, name: 'Madhuka', role: 'All-Rounder' },
  { id: 40, name: 'Shakthi Malshan', role: 'All-Rounder' },
  { id: 41, name: 'Prasad Anawarathne', role: 'All-Rounder' },
  { id: 42, name: 'Mohomad Shylan', role: 'All-Rounder' },
  { id: 44, name: 'Supun Adipaththu', role: 'All-Rounder' },
  { id: 46, name: 'Vidusara Gurusinghe', role: 'All-Rounder' },

];

const generatedPlayers = Array.from({ length: 60 }, (_, index) => {
  const currentId = index + 50; // Starts at ID 9
  return {
    id: currentId,
    name: `Player Name ${currentId}`,
    role: currentId % 2 === 0 ? 'Bowler' : 'Batsman'
  };
});

export const MASTER_PLAYERS = [...realPlayers, ...generatedPlayers];