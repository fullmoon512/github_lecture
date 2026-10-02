// 드래그로 카메라를 움직이고, 거의 움직이지 않은 짧은 터치는 '탭'으로 알린다.
// 탭은 scene.events 의 WORLD_TAP 이벤트로 월드 좌표와 함께 전달된다.
export const WORLD_TAP = 'world-tap';

export function enableCameraDrag(scene, { thresholdPx }) {
  const cam = scene.cameras.main;
  let active = null; // { pointerId, startX, startY, scrollX, scrollY, dragging }

  scene.input.on('pointerdown', (pointer, over) => {
    // 손을 뗀 이벤트를 위쪽 UI 장면이 가져가 끝나지 못한 드래그는 버린다
    // (같은 포인터로 다시 눌렀거나, 그 포인터가 이미 떨어져 있으면)
    if (active && (active.pointerId === pointer.id || !isPointerDown(scene, active.pointerId))) active = null;
    // 두 번째 손가락, 월드 안 버튼 위에서 시작한 입력은 무시
    if (active || over.length > 0) return;
    active = {
      pointerId: pointer.id,
      startX: pointer.x,
      startY: pointer.y,
      scrollX: cam.scrollX,
      scrollY: cam.scrollY,
      dragging: false,
    };
  });

  scene.input.on('pointermove', (pointer) => {
    if (!active || pointer.id !== active.pointerId || !pointer.isDown) return;
    const dx = pointer.x - active.startX;
    const dy = pointer.y - active.startY;

    if (!active.dragging) {
      if (Math.hypot(dx, dy) < thresholdPx) return;
      active.dragging = true;
      cam.panEffect.reset(); // 🏠 이동 중이었다면 손가락을 우선
    }
    cam.setScroll(
      cam.clampX(active.scrollX - dx / cam.zoom),
      cam.clampY(active.scrollY - dy / cam.zoom),
    );
  });

  const end = (pointer, isInside) => {
    if (!active || pointer.id !== active.pointerId) return;
    if (isInside && !active.dragging) {
      scene.events.emit(WORLD_TAP, { x: pointer.worldX, y: pointer.worldY });
    }
    active = null;
  };
  scene.input.on('pointerup', (pointer) => end(pointer, true));
  scene.input.on('pointerupoutside', (pointer) => end(pointer, false));
}

function isPointerDown(scene, id) {
  return scene.input.manager.pointers.some((p) => p.id === id && p.isDown);
}
