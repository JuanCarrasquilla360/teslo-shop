import { Controller, Get, Post, Body, Patch, Param, Delete, UploadedFile, UseInterceptors, BadRequestException, Res, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';
import { InjectRepository } from '@nestjs/typeorm';
import { Response } from 'express';
import { diskStorage } from 'multer';
import { FilesService } from './files.service';
import { fileFilter, fileNamer } from './helpers';

@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly configService: ConfigService
    ) { }

  @Post('product')
  @UseInterceptors(FileInterceptor('file', {
    fileFilter: fileFilter,
    // limits: {fileSize: 100},
    storage: diskStorage({
      destination: './static/products',
      filename: fileNamer
    })
  }))
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Make sure that the file is an image')
    }
    return { secureUrl: `${this.configService.get('HOST_API')}/files/product/${file.filename}`}
  }

  @Get('product/:imageName')
  findProductImage(
    @Res() res: Response,
    @Param('imageName')imageName: string
  ){
    const path = this.filesService.getStaticsProductImage(imageName)
    return res.sendFile(path)
  }
}
