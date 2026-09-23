/**
 * The full YOU LOOP yarn palette — 81 colors.
 *
 * In the original static site this array was inlined three times (once per
 * configurator page) with every swatch embedded as a base64 data URI, which
 * accounted for roughly 700 KB of duplicated markup. The thumbnails are now
 * plain files under /images/yarn and this module is the single source of truth.
 */

export type Yarn = {
  id: string;
  name: string;
  hex: string;
  img: string;
};

export const YARNS: Yarn[] = [
  { id: "63", name: "Hollywood Cerise", hex: "#D90B7B", img: "/images/yarn/63.jpg" },
  { id: "64", name: "Tradewind", hex: "#67B0A9", img: "/images/yarn/64.jpg" },
  { id: "65", name: "Sunset Orange", hex: "#F13D49", img: "/images/yarn/65.jpg" },
  { id: "72", name: "Amethyst Smoke", hex: "#A39AA7", img: "/images/yarn/72.jpg" },
  { id: "73", name: "Tundora", hex: "#413B39", img: "/images/yarn/73.jpg" },
  { id: "74", name: "Wild Strawberry", hex: "#EF3973", img: "/images/yarn/74.jpg" },
  { id: "13", name: "Olive Green", hex: "#C7C266", img: "/images/yarn/13.jpg" },
  { id: "15", name: "Pixie Green", hex: "#AED3B0", img: "/images/yarn/15.jpg" },
  { id: "25", name: "Pixie Green (Light)", hex: "#92A47F", img: "/images/yarn/25.jpg" },
  { id: "66", name: "Ripe Lemon", hex: "#F5E815", img: "/images/yarn/66.jpg" },
  { id: "67", name: "Lightning Yellow", hex: "#F7BA15", img: "/images/yarn/67.jpg" },
  { id: "68", name: "Pure White", hex: "#F3F3F1", img: "/images/yarn/68.jpg" },
  { id: "75", name: "Lavender Pink", hex: "#EE8AAB", img: "/images/yarn/75.jpg" },
  { id: "76", name: "Gun Powder", hex: "#444B66", img: "/images/yarn/76.jpg" },
  { id: "77", name: "Raw Sienna", hex: "#C96C43", img: "/images/yarn/77.jpg" },
  { id: "37", name: "Asparagus", hex: "#6B7E47", img: "/images/yarn/37.jpg" },
  { id: "48", name: "Celery", hex: "#91AD45", img: "/images/yarn/48.jpg" },
  { id: "59", name: "Lochinvar", hex: "#398F86", img: "/images/yarn/59.jpg" },
  { id: "69", name: "Monzo", hex: "#E30920", img: "/images/yarn/69.jpg" },
  { id: "70", name: "Mariner", hex: "#2D70B5", img: "/images/yarn/70.jpg" },
  { id: "71", name: "Curious Blue", hex: "#35A0DB", img: "/images/yarn/71.jpg" },
  { id: "78", name: "Cascade", hex: "#789F99", img: "/images/yarn/78.jpg" },
  { id: "79", name: "Green Leaf", hex: "#366A18", img: "/images/yarn/79.jpg" },
  { id: "80", name: "Shamrock", hex: "#29CF78", img: "/images/yarn/80.jpg" },
  { id: "32", name: "Camouflage Green", hex: "#6E7C64", img: "/images/yarn/32.jpg" },
  { id: "22", name: "Viridian", hex: "#296E63", img: "/images/yarn/22.jpg" },
  { id: "41", name: "Everglade", hex: "#285042", img: "/images/yarn/41.jpg" },
  { id: "06", name: "Cream", hex: "#DFE0D0", img: "/images/yarn/06.jpg" },
  { id: "19", name: "Beige", hex: "#E3DACA", img: "/images/yarn/19.jpg" },
  { id: "27", name: "Flake White", hex: "#CEC8B6", img: "/images/yarn/27.jpg" },
  { id: "14", name: "Heather", hex: "#B4C1CA", img: "/images/yarn/14.jpg" },
  { id: "54", name: "Cornflower", hex: "#97BFDD", img: "/images/yarn/54.jpg" },
  { id: "47", name: "Bermuda", hex: "#9AD9E7", img: "/images/yarn/47.jpg" },
  { id: "62", name: "Mulled Wine", hex: "#604077", img: "/images/yarn/62.jpg" },
  { id: "49", name: "Beauty Bush", hex: "#EAC5C3", img: "/images/yarn/49.jpg" },
  { id: "02", name: "Mandys Pink", hex: "#E9A4A8", img: "/images/yarn/02.jpg" },
  { id: "07", name: "Bizarre", hex: "#EBD8CC", img: "/images/yarn/07.jpg" },
  { id: "10", name: "Blossom", hex: "#EAB6C3", img: "/images/yarn/10.jpg" },
  { id: "43", name: "Kobi", hex: "#DE93C4", img: "/images/yarn/43.jpg" },
  { id: "05", name: "Aqua Island", hex: "#95D5D2", img: "/images/yarn/05.jpg" },
  { id: "28", name: "Breaker Bay", hex: "#5D989D", img: "/images/yarn/28.jpg" },
  { id: "17", name: "Hippie Blue", hex: "#7FA8BB", img: "/images/yarn/17.jpg" },
  { id: "12", name: "Tonys Pink", hex: "#D67371", img: "/images/yarn/12.jpg" },
  { id: "50", name: "Contessa", hex: "#CA575D", img: "/images/yarn/50.jpg" },
  { id: "20", name: "Cardinal", hex: "#B4221C", img: "/images/yarn/20.jpg" },
  { id: "38", name: "Charm", hex: "#DF6B97", img: "/images/yarn/38.jpg" },
  { id: "04", name: "Perfume", hex: "#CCB6DF", img: "/images/yarn/04.jpg" },
  { id: "08", name: "Trendy Pink", hex: "#835B89", img: "/images/yarn/08.jpg" },
  { id: "42", name: "Wedge Wood", hex: "#3F729B", img: "/images/yarn/42.jpg" },
  { id: "55", name: "Indigo", hex: "#5082D0", img: "/images/yarn/55.jpg" },
  { id: "57", name: "St Tropaz", hex: "#294882", img: "/images/yarn/57.jpg" },
  { id: "51", name: "Red", hex: "#AF1E24", img: "/images/yarn/51.jpg" },
  { id: "35", name: "Brick Red", hex: "#931E26", img: "/images/yarn/35.jpg" },
  { id: "31", name: "Persian Red", hex: "#B42A2A", img: "/images/yarn/31.jpg" },
  { id: "24", name: "Burnt Umber", hex: "#B52A2B", img: "/images/yarn/24.jpg" },
  { id: "29", name: "Tall Poppy", hex: "#6F2524", img: "/images/yarn/29.jpg" },
  { id: "58", name: "Crown of Thorns", hex: "#812523", img: "/images/yarn/58.jpg" },
  { id: "40", name: "Brandy Punch", hex: "#C08C35", img: "/images/yarn/40.jpg" },
  { id: "01", name: "Equator", hex: "#AE9846", img: "/images/yarn/01.jpg" },
  { id: "56", name: "Tulip Tree", hex: "#B28A29", img: "/images/yarn/56.jpg" },
  { id: "46", name: "Calypso", hex: "#2A5682", img: "/images/yarn/46.jpg" },
  { id: "44", name: "San Juan", hex: "#263651", img: "/images/yarn/44.jpg" },
  { id: "33", name: "Elm", hex: "#2A5664", img: "/images/yarn/33.jpg" },
  { id: "03", name: "Contessa (Light)", hex: "#D78C71", img: "/images/yarn/03.jpg" },
  { id: "30", name: "Sea Buckthorn", hex: "#E77E25", img: "/images/yarn/30.jpg" },
  { id: "45", name: "Thunderbird", hex: "#BB411C", img: "/images/yarn/45.jpg" },
  { id: "18", name: "Tan", hex: "#B7A086", img: "/images/yarn/18.jpg" },
  { id: "53", name: "Akaroa", hex: "#C7BAA8", img: "/images/yarn/53.jpg" },
  { id: "23", name: "Cape Palliser", hex: "#8F6641", img: "/images/yarn/23.jpg" },
  { id: "39", name: "Shuttle Gray", hex: "#5E6973", img: "/images/yarn/39.jpg" },
  { id: "11", name: "Pewter", hex: "#A5A5A8", img: "/images/yarn/11.jpg" },
  { id: "36", name: "Natural Gray", hex: "#6C6B67", img: "/images/yarn/36.jpg" },
  { id: "16", name: "Primrose", hex: "#EBE593", img: "/images/yarn/16.jpg" },
  { id: "09", name: "Candy Corn", hex: "#EAC53C", img: "/images/yarn/09.jpg" },
  { id: "60", name: "Fire Bush", hex: "#E9A91F", img: "/images/yarn/60.jpg" },
  { id: "26", name: "Sepia Skin", hex: "#7F4E23", img: "/images/yarn/26.jpg" },
  { id: "34", name: "Millbrook", hex: "#63432F", img: "/images/yarn/34.jpg" },
  { id: "61", name: "Irish Coffee", hex: "#39251D", img: "/images/yarn/61.jpg" },
  { id: "52", name: "Ship Gray", hex: "#343436", img: "/images/yarn/52.jpg" },
  { id: "21", name: "Black", hex: "#1D2129", img: "/images/yarn/21.jpg" },
  { id: "73b", name: "Tundora Dark", hex: "#413B3A", img: "/images/yarn/73b.jpg" },
];

export const YARN_COUNT = YARNS.length;
