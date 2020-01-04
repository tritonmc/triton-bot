import SpigotSite from 'spigot-buyer-list';

class SpigotController {
  constructor() {
    this.handler = new SpigotSite(
      process.env.SPIGOT_USERNAME,
      process.env.SPIGOT_PASSWORD,
      process.env.SPIGOT_TFA_SECRET
    );
  }

  refreshLogin() {
    try {
      return this.handler.loginToSpigot();
    } catch (e) {
      console.error('Failed to login into Spigot');
    }
  }

  async refreshBuyers() {
    this.buyers = await this.handler.getBuyersList(process.env.SPIGOT_RESOURCE_ID);
    console.log(`Fetched ${this.buyers.length} buyers from Spigot!`);
  }

  getBuyers() {
    return this.buyers;
  }

  getBuyer(username) {
    return this.getBuyers().find((v) => v.username === username);
  }
}

export default SpigotController;
