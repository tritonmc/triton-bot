//import SpigotSite from 'spigot-buyer-list';

// TODO implement spigot-buyer-list

class SpigotController {
  constructor() {}

  getBuyers() {
    return [
      { id: 12345, username: 'TestUser1' },
      { id: 54321, username: 'TestUser2' },
    ];
  }

  getBuyer(username) {
    return this.getBuyers().find((v) => v.username === username);
  }
}

export default SpigotController;
