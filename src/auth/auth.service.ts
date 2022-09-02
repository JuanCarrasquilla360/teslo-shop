import { Injectable, BadRequestException, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto, LoginUserDto } from './dto';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import * as bc from "bcrypt";
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly jwtService: JwtService
    ) { }

    async create(createUseDto: CreateUserDto) {

        try {
            const { password, ...userData } = createUseDto
            const user = this.userRepository.create({
                ...userData,
                password: bc.hashSync(password, 10)
            })
            await this.userRepository.save(user)
            return {
                ...user,
                token: this.getJwt({ id: user.id })
            }
        } catch (error) {
            this.handleDBErrors(error)
        }
    }

    async login(loginUserDto: LoginUserDto) {

        const { password, email } = loginUserDto
        const user = await this.userRepository.findOne({
            where: { email },
            select: { email: true, password: true, id: true }
        })
        if (!user) throw new UnauthorizedException('Credentials are not valid (email)')
        if (!bc.compareSync(password, user.password)) throw new UnauthorizedException('Credentials are not valid (password)')
        return {
            ...user,
            token: this.getJwt({ id: user.id })
        }

    }

    private getJwt(payload: JwtPayload) {
        const token = this.jwtService.sign(payload)
        return token
    }

    private handleDBErrors(error: any): never {
        if (error.code === '23505') throw new BadRequestException(`${error.detail}`)
        console.log(error)
        throw new InternalServerErrorException('Please check server logs')
    }

    async checkOutStatus(user: User) {
        const userNewToken = {
            ...user,
            token: this.getJwt({ id: user.id })
        }
        return userNewToken

    }
}
