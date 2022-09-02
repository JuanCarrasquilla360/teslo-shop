import { ApiProperty } from "@nestjs/swagger"
import { IsArray, IsIn, IsInt, IsNumber, IsOptional,
    IsPositive, IsString, MinLength } from "class-validator"

export class CreateProductDto {
    @ApiProperty({
        default: 10,
        description: 'How many rows do you need'
    })
    @IsString()
    @MinLength(1)
    title: string

    @ApiProperty({
        default: 0,
        description: 'How many rows do you want to skip'
    })
    @IsNumber()
    @IsPositive()
    @IsOptional()
    price?: number

    @ApiProperty({
        default: 'Quis voluptate pariatur eiusmod eu pariatur amet.',
        description: 'How many rows do you want to descript'
    })
    @IsString()
    @IsOptional()
    description?: string

    @ApiProperty()
    @IsString()
    @IsOptional()
    slug?: string

    @ApiProperty()
    @IsInt()
    @IsPositive()
    @IsOptional()
    stock?: number
    
    @ApiProperty()
    @IsString({each: true})
    @IsArray()
    sizes: string[]
    
    @ApiProperty()
    @IsIn(['men', 'women', 'kid', 'unisex'])
    gender: string
    
    @ApiProperty()
    @IsString({each: true})
    @IsArray()
    @IsOptional()
    tags?: string[]
    
    @ApiProperty()
    @IsString({each: true})
    @IsArray()
    @IsOptional()
    images?: string[]
}
