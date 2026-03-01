import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ProductsService } from '../../../application/products/services/products.service';
import { ListProductsQueryDto } from '../../../application/products/dto/list-products-query.dto';

@ApiTags('products')
@Controller()
export class CatalogController {
  constructor(private readonly productsService: ProductsService) {}

  @ApiOperation({ summary: 'List all product categories' })
  @Get('list-categories')
  listCategories() {
    return this.productsService.listCategories();
  }

  @ApiOperation({ summary: 'List products with optional category filter' })
  @ApiQuery({
    name: 'category',
    required: false,
    description: 'Category slug or category id',
  })
  @Get('list-products')
  listProducts(@Query() query: ListProductsQueryDto) {
    return this.productsService.listProducts(query.category);
  }

  @ApiOperation({ summary: 'Get full product information by slug' })
  @ApiParam({
    name: 'slug',
    required: true,
    description: 'Product slug',
  })
  @Get('product/:slug')
  getProductBySlug(@Param('slug') slug: string) {
    return this.productsService.getProductBySlug(slug);
  }
}
