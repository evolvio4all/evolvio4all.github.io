let map = [];
let outline = [];
let spawnTiles = [];

noise.seed(seededNoiseA()); // We seed our noise generator

function generateMap() {
  for (let x = 0; x < mapSize; x++) {
    map.push([]);
    creatureLocations.push([]);

    for (let y = 0; y < mapSize; y++) {
      let tile = new Tile(x, y);
      if (tile.type == 0) {
        tile = null;
      }

      map[x].push(tile);
    }
  }

  generateOutline();
}

function generateOutline() {
  for (let i = 0; i < mapSize; i++) {
    for (let j = 0; j < mapSize; j++) {
      if (map[i][j] != null) {
        if (i < mapSize - 1 && map[i + 1][j] == null) {
          outline.push([(i + 1) * tileSize, j * tileSize, (i + 1) * tileSize, (j + 1) * tileSize]);
        }

        if (i > 0 && map[i - 1][j] == null) {
          outline.push([i * tileSize, j * tileSize, i * tileSize, (j + 1) * tileSize]);
        }

        if (j < mapSize - 1 && map[i][j + 1] == null) {
          outline.push([i * tileSize, (j + 1) * tileSize, (i + 1) * tileSize, (j + 1) * tileSize]);
        }

        if (j > 0 && map[i][j - 1] == null) {
          outline.push([i * tileSize, j * tileSize, (i + 1) * tileSize, j * tileSize]);
        }
      }
    }
  }
}

function Tile(x, y) {
  var tile = noise.simplex2(x / mapSize * mapComplexity, y / mapSize * mapComplexity) - maxWaterPercentage * 2 + 1;
  tile = Math.min(tile, 1);
  tile += noise.simplex2(x / mapSize * mapComplexity, y / mapSize * mapComplexity) * edgeSmoothness - maxWaterPercentage * 2 + 1;

  // We increase odds of tile being water if it is further away from center (affected by distanceSmoothing)
  tile -= (Math.sqrt(Math.pow(x - mapSize / 2, 2) + Math.pow(y - mapSize / 2, 2)) / (mapSize / 2)) / edgeDistance;

  if (tile < 0) {
    this.type = 0;
  } else if ((1 - everGreenCentralization) + (seededNoiseA() * everGreenCentralization) < tile && seededNoiseA() < everGreenPercentage) {
    this.type = 2;
  } else {
    this.type = 1;
  }

  if (this.type == 1) this.maxFood = parseFloat((seededNoiseA(0.9 * maxTileFood, maxTileFood)).toFixed(2));
  else if (this.type == 2) this.maxFood = parseFloat((seededNoiseA(0.9 * maxTileFood, maxTileFood) * everGreenMaxFoodModifier).toFixed(2));
  else if (this.type == 0) this.maxFood = 0;

  this.food = this.maxFood;

  this.x = x;
  this.y = y;

  if (this.type) {
    spawnTiles.push(this);
  }
}