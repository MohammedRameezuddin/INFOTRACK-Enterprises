import { Controller, Get, Param, Post, Body } from '@nestjs/common';

@Controller('products')
export class ProductsController {
  constructor() {}

  @Get()
  getAll() {
    return [
      { id: 1, title: 'Dell Latitude 7440', price: 98500, stock: 10 },
      { id: 2, title: 'Cisco Switch 24-port', price: 45000, stock: 5 }
    ];
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return { id, title: `Product ${id}`, price: 1000 };
  }

  @Post()
  create(@Body() body: any) {
    return { id: Date.now(), ...body };
  }
}
