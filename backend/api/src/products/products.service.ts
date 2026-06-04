import { Injectable } from '@nestjs/common';

@Injectable()
export class ProductsService {
  private items = [
    { id: 1, title: 'Dell Latitude 7440', price: 98500, stock: 10 },
    { id: 2, title: 'Cisco Switch 24-port', price: 45000, stock: 5 }
  ];

  findAll() {
    return this.items;
  }

  findOne(id: number) {
    return this.items.find(i => i.id === id);
  }

  create(payload: any) {
    const newItem = { id: Date.now(), ...payload };
    this.items.push(newItem);
    return newItem;
  }
}
