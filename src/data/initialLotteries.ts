import { LotteryMarket } from '../types';

export const INITIAL_LOTTERIES: LotteryMarket[] = [
  {
    id: 'lao-dev',
    name: 'หวยลาวพัฒนา (Lao Dev)',
    country: 'สปป.ลาว 🇱🇦',
    flag: '🇱🇦',
    category: 'LAO',
    closeTime: '20:00',
    openDays: 'จันทร์, พุธ, ศุกร์',
    status: 'OPEN',
    payoutRates: {
      top3: 900,
      tod3: 130,
      top2: 92,
      bottom2: 92,
      runTop: 3.2,
      runBottom: 4.2
    },
    description: 'หวยพัฒนา สปป.ลาว ยอดนิยม ออกรางวัลทุกวันจันทร์ พุธ และศุกร์ เวลา 20:30 น.'
  },
  {
    id: 'lao-vip',
    name: 'หวยลาว VIP',
    country: 'สปป.ลาว 🇱🇦',
    flag: '🇱🇦',
    category: 'LAO',
    closeTime: '21:30',
    openDays: 'ทุกวัน',
    status: 'OPEN',
    payoutRates: {
      top3: 900,
      tod3: 130,
      top2: 92,
      bottom2: 92,
      runTop: 3.2,
      runBottom: 4.2
    },
    description: 'หวยลาว VIP รอบดึก ออกรางวัลทุกวันเวลา 21:45 น.'
  },
  {
    id: 'lao-extra',
    name: 'หวยลาว Extra',
    country: 'สปป.ลาว 🇱🇦',
    flag: '🇱🇦',
    category: 'LAO',
    closeTime: '08:00',
    openDays: 'ทุกวัน',
    status: 'OPEN',
    payoutRates: {
      top3: 900,
      tod3: 130,
      top2: 92,
      bottom2: 92,
      runTop: 3.2,
      runBottom: 4.2
    },
    description: 'หวยลาวรอบเช้า ออกรางวัลทุกวันเวลา 08:30 น.'
  },
  {
    id: 'hanoi-normal',
    name: 'หวยฮานอย ปกติ',
    country: 'เวียดนาม 🇻🇳',
    flag: '🇻🇳',
    category: 'HANOI',
    closeTime: '18:00',
    openDays: 'ทุกวัน',
    status: 'OPEN',
    payoutRates: {
      top3: 900,
      tod3: 130,
      top2: 92,
      bottom2: 92,
      runTop: 3.2,
      runBottom: 4.2
    },
    description: 'หวยฮานอยหลักจากเวียดนาม ออกรางวัลทุกวันเวลา 18:30 น.'
  },
  {
    id: 'hanoi-special',
    name: 'หวยฮานอย พิเศษ',
    country: 'เวียดนาม 🇻🇳',
    flag: '🇻🇳',
    category: 'HANOI',
    closeTime: '17:00',
    openDays: 'ทุกวัน',
    status: 'OPEN',
    payoutRates: {
      top3: 900,
      tod3: 130,
      top2: 92,
      bottom2: 92,
      runTop: 3.2,
      runBottom: 4.2
    },
    description: 'หวยฮานอยรอบเย็น ออกรางวัลทุกวันเวลา 17:30 น.'
  },
  {
    id: 'hanoi-vip',
    name: 'หวยฮานอย VIP',
    country: 'เวียดนาม 🇻🇳',
    flag: '🇻🇳',
    category: 'HANOI',
    closeTime: '19:00',
    openDays: 'ทุกวัน',
    status: 'OPEN',
    payoutRates: {
      top3: 900,
      tod3: 130,
      top2: 92,
      bottom2: 92,
      runTop: 3.2,
      runBottom: 4.2
    },
    description: 'หวยฮานอยรอบค่ำ VIP ออกรางวัลทุกวันเวลา 19:30 น.'
  },
  {
    id: 'stock-nikkei',
    name: 'หวยหุ้นนิเคอิ (Nikkei 225)',
    country: 'ญี่ปุ่น 🇯🇵',
    flag: '🇯🇵',
    category: 'STOCK',
    closeTime: '12:50',
    openDays: 'จันทร์ - ศุกร์',
    status: 'OPEN',
    payoutRates: {
      top3: 850,
      tod3: 120,
      top2: 92,
      bottom2: 92,
      runTop: 3.2,
      runBottom: 4.2
    },
    description: 'อ้างอิงดัชนีหุ้น Nikkei 225 รอบบ่าย ปิดรับ 12:50 น.'
  },
  {
    id: 'stock-hangseng',
    name: 'หวยหุ้นฮั่งเส็ง (Hang Seng)',
    country: 'ฮ่องกง 🇭🇰',
    flag: '🇭🇰',
    category: 'STOCK',
    closeTime: '15:30',
    openDays: 'จันทร์ - ศุกร์',
    status: 'OPEN',
    payoutRates: {
      top3: 850,
      tod3: 120,
      top2: 92,
      bottom2: 92,
      runTop: 3.2,
      runBottom: 4.2
    },
    description: 'อ้างอิงดัชนีหุ้น Hang Seng รอบบ่าย ปิดรับ 15:30 น.'
  },
  {
    id: 'stock-dowjones',
    name: 'หวยหุ้นดาวโจนส์ (Dow Jones)',
    country: 'สหรัฐอเมริกา 🇺🇸',
    flag: '🇺🇸',
    category: 'STOCK',
    closeTime: '01:00',
    openDays: 'จันทร์ - ศุกร์',
    status: 'OPEN',
    payoutRates: {
      top3: 850,
      tod3: 120,
      top2: 92,
      bottom2: 92,
      runTop: 3.2,
      runBottom: 4.2
    },
    description: 'อ้างอิงดัชนีตลาดหุ้น Dow Jones สหรัฐอเมริกา'
  },
  {
    id: 'us-powerball',
    name: 'US Powerball (ลอตเตอรี่อเมริกา)',
    country: 'สหรัฐอเมริกา 🇺🇸',
    flag: '🇺🇸',
    category: 'GLOBAL',
    closeTime: '22:00',
    openDays: 'อังคาร, พฤหัสบดี, อาทิตย์',
    status: 'OPEN',
    isPowerballType: true,
    payoutRates: {
      top3: 1000,
      tod3: 150,
      top2: 95,
      bottom2: 95,
      runTop: 3.5,
      runBottom: 4.5,
      powerballJackpot: 500000000
    },
    description: 'ลอตเตอรี่แจ็กพอตยักษ์สากล สุ่มเลข 5 ตัวหลัก (1-69) + 1 Powerball (1-26) ลุ้นรางวัลใหญ่สะสม'
  }
];
