import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { Meals } from 'src/modules/meals/meals.entity';
import { DataSource } from 'typeorm';

@Injectable()
export class MealsService {
  private logger = new Logger(MealsService.name);
  constructor(
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
  ) {}

  // 급식 정보를 가져오는 함수
  async getMeals(): Promise<{ message: string; data: any }> {
    this.logger.log('getMeals method called');
    // 급식 레포지토리를 가져옵니다.
    const mealsRepository = this.dataSource.getRepository(Meals);
    // 현재 날짜를 가져옵니다.
    const date = new Date();

    // 해당 날짜의 급식 정보를 찾습니다.
    const foundMeals = await mealsRepository
      .createQueryBuilder('meals')
      .where('DATE(meals.date) = DATE(:date)', { date: date })
      .getOne();
    let currentMeals = [];

    // 급식 정보가 없으면 API를 호출하여 정보를 가져옵니다.
    if (!foundMeals) {
      this.logger.log('No meals found, calling API');
      // API 호출에 필요한 파라미터를 설정합니다.
      const params = {
        KEY: this.configService.get<string>('NEIS_API_KEY'),
        Type: 'json',
        ATPT_OFCDC_SC_CODE: this.configService.get<string>('NEIS_STATECODE'),
        SD_SCHUL_CODE: this.configService.get<string>('NEIS_SCHULCODE'),
        MLSV_YMD: `${date.getFullYear()}${String(date.getMonth() + 1).padStart(
          2,
          '0',
        )}${String(date.getDate()).padStart(2, '0')}`,
      };

      // API를 호출하여 급식 정보를 가져옵니다.
      const response = await axios.get(
        'https://open.neis.go.kr/hub/mealServiceDietInfo',
        { params },
      );

      let dishes = [];

      // API 응답을 처리합니다.
      if (response.data?.RESULT?.CODE === 'INFO-200') {
        dishes.push('Not Founded');
      } else {
        dishes = response.data.mealServiceDietInfo[1].row[0].DDISH_NM.split(
          '<br/>',
        ).map((dish: string) => dish.split(' ')[0].replace('H', ''));
      }
      const newMeal = mealsRepository.create({
        date: date,
        data: dishes,
      });

      await mealsRepository.save(newMeal);
      currentMeals = newMeal.data;
    } else {
      currentMeals = foundMeals.data;
    }

    return { message: 'successed', data: currentMeals };
  }
}
