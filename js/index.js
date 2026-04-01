var map = new AMap.Map("container", {
  center: [108.9236, 34.5575],
  zoom: 5,
  mapStyle: "amap://styles/grey"
});

let successCount = 0;
let allPolygons = []; // 存储所有城市多边形，用于自动适配视野

function addCityPolygon(boundaries, city) {
  boundaries.forEach(path => {
    let polygon = new AMap.Polygon({
      path: path,
      fillColor: "#FF4444",
      strokeColor: "#fff",
      fillOpacity: 0.7,
      strokeWeight: 1
    });

    // 将多边形加入数组
    allPolygons.push(polygon);

    polygon.on("mouseover", () => {
        polygon.setOptions({ fillColor: "#FF8888", strokeWeight: 2 });
        map.setDefaultCursor("pointer");
    });
    polygon.on("mouseout", () => {
        polygon.setOptions({ fillColor: "#FF4444", strokeWeight: 1 });
        map.setDefaultCursor("default");
    });

    polygon.on("click", function(e) {
      // 安全判断
      if (typeof cityInfo === "undefined" || !cityInfo[city]) {
        return;
      }

      map.clearInfoWindow();
      const info = cityInfo[city];
      const imgHtml = info.imgs.map(img => `<img src="${img}" alt="${info.name}">`).join("");

      const infoWindow = new AMap.InfoWindow({
        content: `
          <div class="info-card">
            <h3>${info.name}</h3>
            <div class="img-group">${imgHtml}</div>
            <p>${info.desc}</p>
          </div>
        `,
        offset: new AMap.Pixel(0, -20),
        closeWhenClickMap: true
      });

      infoWindow.open(map, e.lnglat);
    });

    map.add(polygon);
  });
}

async function loadAllCities() {
  for (let city of CITY_LIST) {
    try {
      const res = await fetch(`./json/${city}.geojson`);
      if (!res.ok) throw new Error("加载失败");
      
      const data = await res.json();
      const coords = data.features[0].geometry.coordinates;
      addCityPolygon(coords, city);

      successCount++;
      document.getElementById("cityCount").innerText = `已点亮 ${successCount} 个城市`;
    } catch (e) {
      console.error("加载失败：", city, e);
    }
  }

  // 🔥 加载完所有城市后，自动适配视野（移动端/PC端都完美显示）
  setTimeout(() => {
    if (allPolygons.length > 0) {
      map.setFitView(allPolygons, {
        padding: [60, 30, 100, 30], // 上、右、下、左留白，避开底部栏
        zoomEnable: true
      });
    }
  }, 300);
}

loadAllCities();
