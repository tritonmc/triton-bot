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
    return this.handler
      .loginToSpigot()
      .catch((e) => console.log('Failed to login into Spigot :(', e));
  }

  async refreshBuyers() {
    try {
      this.buyers = await this.handler.getBuyersList(process.env.SPIGOT_RESOURCE_ID);
      console.log(`Fetched ${this.buyers.length} buyers from Spigot!`);
    } catch (e) {
      console.log('Failed to fetch buyers from Spigot :(', e);
    }
  }

  getBuyers() {
    return this.buyers;
  }

  getBuyer(username) {
    return this.getBuyers().find((v) => v.username === username);
  }
}

export default SpigotController;
