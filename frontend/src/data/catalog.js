export const isSamplePage = (path) => ["/card/sample", "/banner/samples", "/leaflet/samples", "/sticker/samples"].includes(path);

export const catalogPages = [
  {name: "홈페이지 제작", path: "/page"},
  {name: "명함/가격", path: "/card", banner: "/images/상품페이지배너.png", bannerRegion: [142, 103, 3285, 577]},
  {name: "명함/샘플 보기", path: "/card/sample", banner: "/images/명함샘플.png"},
  {name: "현수막/가격", path: "/banner", banner: "/images/상품페이지배너.png", bannerRegion: [3805, 97, 3285, 590]},
  {name: "현수막/샘플 보기", path: "/banner/samples", banner: "/images/현수막샘플.png"},
  {name: "전단/포스터/가격", path: "/leaflet", banner: "/images/상품페이지배너.png", bannerRegion: [7507, 97, 3284, 590]},
  {name: "전단/포스터/샘플 보기", path: "/leaflet/samples", banner: "/images/전단지샘플.png"},
  {name: "스티커/가격", path: "/sticker", banner: "/images/상품페이지배너.png", bannerRegion: [142, 1071, 3285, 590]},
  {name: "스티커/샘플 보기", path: "/sticker/samples", banner: "/images/스티커샘플.png"},
  {name: "봉투", path: "/envelope", banner: "/images/상품페이지배너.png", bannerRegion: [3805, 1071, 3285, 591]},
  {name: "카탈로그", path: "/catalog", banner: "/images/상품페이지배너.png", bannerRegion: [75, 1866, 3284, 591]},
  {name: "종이자석", path: "/paper_magnet", banner: "/images/상품페이지배너.png", bannerRegion: [7480, 1967, 3285, 591]},
  {name: "명찰/신분증", path: "/name_tag", banner: "/images/상품페이지배너.png", bannerRegion: [7507, 1071, 3284, 590]},
  {name: "판촉물", path: "/promotional_item", banner: "/images/상품페이지배너.png", bannerRegion: [3806, 1983, 3284, 591]},
  {name: "부동산모음", path: "/property", banner: "/images/상품페이지배너.png", bannerRegion: [76, 2721, 3283, 590]},
];
