import axios from 'axios';

class SongodaController {
  constructor() {
    this.buyers = [];
    this.axios = axios.create({
      baseURL: 'https://songoda.com/api',
    });
  }

  async refreshBuyers() {
    try {
      const buyers = [];
      const handleResponse = (req) => {
        buyers.push(
          ...req.data.data
            .filter((buyer) => buyer.status === 'Completed')
            .map((buyer) => ({
              id: buyer.order_number,
              username: buyer.username,
              discord: buyer.discord,
            }))
        );
      };
      const response = await this.axios.get(
        `/dashboard/products/${process.env.SONGODA_RESOURCE}/payments`,
        {
          params: {
            token: process.env.SONGODA_TOKEN,
          },
        }
      );
      handleResponse(response);
      for (let i = 2; i <= response.data.meta.last_page; i++)
        handleResponse(
          await this.axios.get(`/dashboard/products/${process.env.SONGODA_RESOURCE}/payments`, {
            params: { page: i, token: process.env.SONGODA_TOKEN },
          })
        );
      this.buyers = buyers;
      console.log(`Fetched ${this.buyers.length} buyers from Songoda!`);
    } catch (e) {
      console.error('Failed to fetch Songoda buyers.', e);
    }
  }

  getBuyers() {
    return this.buyers;
  }

  getBuyer(discord) {
    return this.getBuyers().find((v) => v.discord === discord);
  }
}

export default SongodaController;
