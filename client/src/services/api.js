class Api {
  async updateMenuOrder(pages) {
    return this.put('/pages/menu/order', { pages });
  }

  async updateSubOrder(pages) {
    return this.put('/pages/sub-order', { pages });
  }
} 