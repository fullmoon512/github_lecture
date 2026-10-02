import { drawCrop } from '../objects/cropLook.js';
import { createButton, MIN_TOUCH } from './button.js';

const MARGIN = 6;
const GAP = 4;

// 좌측 하단 씨앗 선택 바. 해금된 작물 중 하나를 고르면 그대로 유지된다
export default class SeedBar {
  constructor(scene, cropIds) {
    this.selected = cropIds[0] ?? null;
    const y = scene.cameras.main.height - MARGIN - MIN_TOUCH;

    this.buttons = cropIds.map((id, k) => {
      const button = createButton(scene, MARGIN + k * (MIN_TOUCH + GAP), y, {
        draw: (g, cx, cy) => drawCrop(g, cx, cy + 6, id, 1),
        onTap: () => this.select(id),
      });
      return { id, button };
    });
    this.select(this.selected);
  }

  select(id) {
    this.selected = id;
    this.buttons.forEach(({ id: bid, button }) => button.setSelected(bid === id));
  }
}
