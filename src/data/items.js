// 품목 한글 이름. 수치가 아닌 표시용 글자라 코드에 둔다
const NAMES = {
  carrot: '당근',
  herb: '허브',
  tomato: '토마토',
  carrot_juice: '당근주스',
  tomato_juice: '토마토주스',
  carrot_jam: '당근잼',
  tomato_jam: '토마토잼',
  herb_tea: '허브차',
  egg: '달걀',
  milk: '우유',
  feather: '깃털',
  clover: '클로버',
};

export function itemName(id) {
  return NAMES[id] ?? id;
}

// 창고에 보이는 순서: 작물 → 요리 → 동물 선물 (config 에 적힌 순서 그대로)
export function itemOrder(config) {
  return [...Object.keys(config.crops), ...Object.keys(config.cooking.recipes), ...config.gifts.items];
}

// 음식 분류: 작물 그대로는 'raw'(생채소), 요리는 레시피의 분류. 음식이 아니면(동물 선물 등) null
export function foodCategory(id, config) {
  if (config.crops[id]) return 'raw';
  return config.cooking.recipes[id]?.category ?? null;
}
