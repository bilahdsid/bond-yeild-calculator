import { Module } from '@nestjs/common';
import { BondController } from './bond.controller.js';
import { BondService } from './bond.service.js';

@Module({
  controllers: [BondController],
  providers: [BondService],
})
export class BondModule {}
