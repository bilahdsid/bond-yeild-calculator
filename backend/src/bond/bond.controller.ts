import { Controller, Post, Body } from '@nestjs/common';
import { BondService } from './bond.service.js';
import { BondCalcDto } from './dto/bond-calc.dto.js';

@Controller('api/bond')
export class BondController {
  constructor(private readonly bondService: BondService) {}

  @Post('calculate')
  calculate(@Body() dto: BondCalcDto) {
    return this.bondService.calculate(dto);
  }
}
