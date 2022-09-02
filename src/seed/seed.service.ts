import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductsService } from '../products/products.service';
import { initialData } from './data/seed-data';
import { User } from '../auth/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SeedService {

  constructor(
    private readonly productService: ProductsService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) { }

  async runSeed() {
    await this.deleteTables()
    const adminUser = await this.insertUsers()

    await this.insertNewProducts(adminUser)
    return `Seed excuted`;
  }

  private async insertNewProducts(user: User) {

    const products = initialData.products

    const insertPromises = []

    products.forEach(product => {
      insertPromises.push(this.productService.create(product, user))
    })

    return await Promise.all(insertPromises)

  }

  private async insertUsers() {
    const seedUsers = initialData.users
    const users: User[] = []
    seedUsers.forEach(user => {
      users.push(this.userRepository.create(user))
    })
    const userDb = await this.userRepository.save(seedUsers)
    return userDb[0]
  }

  private async deleteTables() {
    await this.productService.deleteAllProducts()
    const queryBuilder = this.userRepository.createQueryBuilder()
    await queryBuilder
      .delete()
      .where({})
      .execute()
  }
}
