// 지금 심을 수 있는 작물 id 목록. 온기 해금은 12단계에서 붙인다
export function unlockedCrops(crops) {
  return Object.keys(crops).filter((id) => crops[id].unlock === 'start');
}
