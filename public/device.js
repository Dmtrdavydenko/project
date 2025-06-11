
  if (window.DeviceOrientationEvent) {
    window.addEventListener("deviceorientation", (event) => {
      const alpha = event.alpha; // Угол вокруг оси Z
      const beta = event.beta; // Угол вокруг оси X
      const gamma = event.gamma; // Угол вокруг оси Y
      DeviceOrientationEvent.textContent = `Alpha: ${alpha.toFixed(2)}, Beta: ${beta.toFixed(2)}, Gamma: ${gamma.toFixed(2)}`;
    });
  } else {
    console.log("Ваше устройство не поддерживает Device Orientation API.");
  }

  if (window.DeviceMotionEvent) {
    window.addEventListener("devicemotion",function (event) {
        // Получаем данные акселерометра
        const acceleration = event.acceleration; // Ускорение в м/с²
        const accelerationIncludingGravity = event.accelerationIncludingGravity; // Ускорение с учетом силы тяжести

        console.log("Ускорение (без учета тяжести):");
        console.log("X: " + acceleration.x);
        console.log("Y: " + acceleration.y);
        console.log("Z: " + acceleration.z);

        console.log("Ускорение (с учетом тяжести):");
        console.log("X: " + accelerationIncludingGravity.x);
        console.log("Y: " + accelerationIncludingGravity.y);
        console.log("Z: " + accelerationIncludingGravity.z);

        DeviceMotionEvent.textContent = `${acceleration.x} ${acceleration.y} ${acceleration.z}`+
          `${accelerationIncludingGravity.x} ${accelerationIncludingGravity.y} ${accelerationIncludingGravity.z}`;

        DeviceMotionEvent.textContent = "X "+acceleration.x+"Y "+acceleration.y+"Z "+acceleration.z;
      },false);
  } else {
    console.log("Ваше устройство не поддерживает Device Motion API.");
  }