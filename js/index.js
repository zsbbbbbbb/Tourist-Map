var map = new AMap.Map("container", {
  center: [108.9236, 34.5575],
  zoom: 5,
  mapStyle: "amap://styles/grey"
});

let successCount = 0;

function addCityPolygon(boundaries, city) {
  boundaries.forEach(path => {
    let polygon = new AMap.Polygon({
      path: path,
      fillColor: "#FF4444",
      strokeColor: "#fff",
      fillOpacity: 0.7,
      strokeWeight: 1
    });

    polygon.on("mouseover", () => {
      polygon.setOptions({ fillColor: "#FF8888", strokeWeight: 2 });
      map.setDefaultCursor("pointer");
    });

    polygon.on("mouseout", () => {
      polygon.setOptions({ fillColor: "#FF4444", strokeWeight: 1 });
      map.setDefaultCursor("default");
    });

    polygon.on("click", function(e) {
      // 安全判断（不报错、不崩溃）
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

const CITY_LIST = [
  "jinhua","hangzhou","ningbo","shanghai","shaoxingshi",
  "wenzhou","taizhou","ningde","nanjing","kunming",
  "dali","lijiang","diqing","guangzhou","changsha",
  "suzhou","wuhan","huzhou","quzhou","xiamen"
];

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
}

loadAllCities();