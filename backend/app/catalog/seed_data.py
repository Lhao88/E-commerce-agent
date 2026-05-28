from decimal import Decimal
from typing import Any


def money(value: int) -> Decimal:
    return Decimal(str(value))


ANCHOR_PRODUCTS = [
    {
        "id": "laptop-aurora-15",
        "name": "Aurora 15 游戏本",
        "category": "laptop",
        "brand": "Aurora",
        "price": money(4899),
        "stock": 18,
        "tags": ["游戏", "学生", "高性能", "散热"],
        "specs": {
            "cpu": "AMD Ryzen 7",
            "gpu": "RTX 4050",
            "memory": "16GB",
            "storage": "1TB SSD",
            "screen": "15.6 英寸 144Hz",
            "weight": "2.1kg",
            "battery": "60Wh",
        },
        "selling_points": ["RTX 独显", "高刷屏", "双风扇散热", "性价比高"],
        "after_sales_policy": "7 天无理由退换，2 年主要部件保修。",
    },
    {
        "id": "laptop-redmi-g-pro",
        "name": "Redmi G Pro 2026",
        "category": "laptop",
        "brand": "Redmi",
        "price": money(5299),
        "stock": 12,
        "tags": ["游戏", "高性能", "大屏", "散热"],
        "specs": {
            "cpu": "Intel Core i7",
            "gpu": "RTX 4060",
            "memory": "16GB",
            "storage": "1TB SSD",
            "screen": "16 英寸 165Hz",
            "weight": "2.35kg",
            "battery": "80Wh",
        },
        "selling_points": ["RTX 4060", "16 英寸高刷屏", "性能释放强", "适合大型游戏"],
        "after_sales_policy": "7 天无理由退换，2 年整机保修。",
    },
    {
        "id": "laptop-feather-14",
        "name": "FeatherBook 14 轻薄本",
        "category": "laptop",
        "brand": "Feather",
        "price": money(4399),
        "stock": 25,
        "tags": ["办公", "轻薄", "学生", "长续航"],
        "specs": {
            "cpu": "Intel Core Ultra 5",
            "gpu": "集成显卡",
            "memory": "16GB",
            "storage": "512GB SSD",
            "screen": "14 英寸 2.8K",
            "weight": "1.25kg",
            "battery": "72Wh",
        },
        "selling_points": ["轻薄便携", "长续航", "屏幕细腻", "适合办公学习"],
        "after_sales_policy": "7 天无理由退换，1 年整机保修。",
    },
    {
        "id": "earbuds-airbloom-pro",
        "name": "AirBloom Pro 降噪耳机",
        "category": "earphone",
        "brand": "AirBloom",
        "price": money(899),
        "stock": 42,
        "tags": ["送礼", "女生", "降噪", "通勤", "运动"],
        "specs": {
            "noise_control": "45dB 主动降噪",
            "battery": "36 小时",
            "waterproof": "IP54",
            "weight": "4.8g/只",
        },
        "selling_points": ["佩戴轻", "颜色精致", "通勤降噪", "礼盒包装"],
        "after_sales_policy": "7 天无理由退换，1 年质保，耳塞套免费换新一次。",
    },
    {
        "id": "watch-luna-fit",
        "name": "Luna Fit 智能手表",
        "category": "smartwatch",
        "brand": "Luna",
        "price": money(1299),
        "stock": 31,
        "tags": ["送礼", "女生", "运动", "健康", "长续航"],
        "specs": {
            "screen": "1.43 英寸 AMOLED",
            "battery": "10 天",
            "health": "心率/血氧/睡眠",
            "waterproof": "5ATM",
        },
        "selling_points": ["外观轻巧", "健康监测", "运动模式丰富", "续航稳定"],
        "after_sales_policy": "7 天无理由退换，1 年保修。",
    },
    {
        "id": "phone-pixelnova-8",
        "name": "PixelNova 8 影像手机",
        "category": "phone",
        "brand": "PixelNova",
        "price": money(2999),
        "stock": 20,
        "tags": ["送礼", "女生", "拍照", "长续航"],
        "specs": {
            "screen": "6.5 英寸 OLED",
            "camera": "5000 万像素主摄 + 人像镜头",
            "battery": "5100mAh",
            "storage": "256GB",
        },
        "selling_points": ["人像好看", "续航强", "机身轻", "拍照直出稳定"],
        "after_sales_policy": "7 天无理由退换，1 年整机保修，电池 1 年保修。",
    },
    {
        "id": "tablet-noteair-11",
        "name": "NoteAir 11 学习平板",
        "category": "tablet",
        "brand": "NoteAir",
        "price": money(2499),
        "stock": 16,
        "tags": ["学习", "笔记", "学生", "送礼"],
        "specs": {
            "screen": "11 英寸 2.5K",
            "pen": "4096 级压感手写笔",
            "battery": "8200mAh",
            "weight": "480g",
        },
        "selling_points": ["手写延迟低", "护眼屏", "网课笔记方便", "价格友好"],
        "after_sales_policy": "7 天无理由退换，1 年整机保修。",
    },
    {
        "id": "camera-vlog-mini",
        "name": "Vlog Mini 便携相机",
        "category": "camera",
        "brand": "Vlog",
        "price": money(3299),
        "stock": 8,
        "tags": ["拍摄", "旅行", "视频", "送礼"],
        "specs": {
            "sensor": "1 英寸",
            "video": "4K 60fps",
            "stabilization": "五轴防抖",
            "weight": "310g",
        },
        "selling_points": ["便携", "视频规格高", "防抖稳定", "适合旅行记录"],
        "after_sales_policy": "7 天无理由退换，1 年保修，镜头组件单独保修。",
    },
]


def product(
    product_id: str,
    name: str,
    category: str,
    brand: str,
    price: int,
    stock: int,
    tags: list[str],
    specs: dict[str, Any],
    selling_points: list[str],
    after_sales_policy: str,
) -> dict[str, Any]:
    return {
        "id": product_id,
        "name": name,
        "category": category,
        "brand": brand,
        "price": money(price),
        "stock": stock,
        "tags": tags,
        "specs": specs,
        "selling_points": selling_points,
        "after_sales_policy": after_sales_policy,
    }


def generate_phone_products() -> list[dict[str, Any]]:
    brands = [
        ("Apple", ["iPhone 16", "iPhone 16 Plus", "iPhone 16 Pro", "iPhone 15"]),
        ("Huawei", ["Mate 70", "Pura 70", "nova 13", "Mate X6"]),
        ("Xiaomi", ["Xiaomi 15", "Xiaomi 15 Pro", "Redmi K80", "Redmi Note 14 Pro"]),
        ("OPPO", ["Find X8", "Reno 13", "OnePlus 13", "A5 Pro"]),
        ("vivo", ["X200", "X200 Pro", "S20", "iQOO 13"]),
        ("Honor", ["Magic7", "Magic7 Pro", "Honor 300", "X60 Pro"]),
        ("Samsung", ["Galaxy S25", "Galaxy S24 FE", "Galaxy Z Flip6", "Galaxy A56"]),
        ("realme", ["GT7 Pro", "Neo7", "GT Neo6", "V60 Pro"]),
        ("Meizu", ["21 Pro", "21 Note", "Lucky 08", "20 Classic"]),
    ]
    camera_specs = ["5000 万像素主摄", "5000 万像素三摄", "潜望长焦三摄", "双主摄影像系统"]
    screens = ["6.1 英寸 OLED", "6.36 英寸 OLED", "6.7 英寸 OLED", "6.82 英寸 LTPO OLED"]
    products = []
    index = 1
    for brand, models in brands:
        for model in models:
            tier = (index - 1) % 4
            price = [2199, 3299, 4599, 6999][tier] + (index % 3) * 200
            tags = ["拍照", "长续航"] if tier >= 1 else ["学生", "性价比"]
            if tier == 3:
                tags += ["高性能", "送礼"]
            if brand in {"Apple", "Huawei", "Honor"}:
                tags.append("送礼")
            products.append(
                product(
                    f"phone-{index:03d}",
                    f"{model} {['标准版', '大内存版', 'Pro 版', '旗舰版'][tier]}",
                    "phone",
                    brand,
                    price,
                    20 + (index * 7) % 80,
                    tags,
                    {
                        "screen": screens[index % len(screens)],
                        "camera": camera_specs[index % len(camera_specs)],
                        "battery": f"{4700 + (index % 8) * 150}mAh",
                        "storage": ["128GB", "256GB", "512GB", "1TB"][tier],
                        "charging": ["33W", "67W", "80W", "100W"][tier],
                    },
                    ["屏幕素质稳定", "影像表现均衡", "系统生态成熟", "日常续航可靠"],
                    "7 天无理由退换，1 年整机保修，电池与充电器按官方政策保修。",
                )
            )
            index += 1
    return products


def generate_laptop_products() -> list[dict[str, Any]]:
    brands = [
        ("Lenovo", ["ThinkBook 14+", "小新 Pro 14", "拯救者 R7000", "拯救者 Y9000P"]),
        ("ASUS", ["天选 5", "灵耀 14", "无畏 Pro 15", "ROG 魔霸新锐"]),
        ("HP", ["战 66", "星 Book Pro", "暗影精灵 10", "ENVY 14"]),
        ("Dell", ["Inspiron 14", "灵越 16 Plus", "XPS 13", "G15"]),
        ("Apple", ["MacBook Air 13", "MacBook Air 15", "MacBook Pro 14", "MacBook Pro 16"]),
        ("Huawei", ["MateBook 14", "MateBook X Pro", "MateBook D 16", "MateBook GT 14"]),
        ("Redmi", ["Book Pro 14", "Book Pro 16", "G Pro", "Book 14"]),
        ("MSI", ["Cyborg 15", "Stealth 14", "Prestige 16", "Raider GE68"]),
        ("Acer", ["Swift Go 14", "非凡 Go Pro", "暗影骑士 16", "Predator Helios Neo"]),
    ]
    cpus = ["Intel Core i5", "Intel Core Ultra 5", "Intel Core Ultra 7", "AMD Ryzen 7", "Apple M4"]
    gpus = ["集成显卡", "Radeon 780M", "RTX 4050", "RTX 4060", "RTX 4070"]
    products = []
    index = 1
    for brand, models in brands:
        for model in models:
            gaming = any(word in model for word in ["拯救者", "天选", "ROG", "暗影", "G15", "G Pro", "GT"])
            tier = (index - 1) % 4
            price = (4999 + tier * 1300 + (index % 4) * 200) if gaming else (3299 + tier * 1000)
            tags = ["游戏", "高性能", "散热"] if gaming else ["办公", "轻薄", "学生", "长续航"]
            products.append(
                product(
                    f"laptop-{index:03d}",
                    f"{brand} {model} {['16GB/512GB', '16GB/1TB', '32GB/1TB', '高配版'][tier]}",
                    "laptop",
                    brand,
                    price,
                    10 + (index * 5) % 60,
                    tags,
                    {
                        "cpu": cpus[index % len(cpus)],
                        "gpu": gpus[2 + tier % 3] if gaming else gpus[tier % 2],
                        "memory": "32GB" if tier == 3 else "16GB",
                        "storage": "1TB SSD" if tier >= 1 else "512GB SSD",
                        "screen": "16 英寸 165Hz" if gaming else ["14 英寸 2.8K", "15.3 英寸 Liquid Retina", "16 英寸 2.5K"][tier % 3],
                        "weight": f"{2.15 + tier * 0.12:.2f}kg" if gaming else f"{1.25 + tier * 0.1:.2f}kg",
                        "battery": f"{60 + tier * 8}Wh",
                    },
                    ["性能释放稳定", "屏幕观感细腻", "接口配置实用", "售后网点覆盖广"],
                    "7 天无理由退换，1 年整机保修，主要部件按品牌政策延保。",
                )
            )
            index += 1
    return products


def generate_tablet_products() -> list[dict[str, Any]]:
    brands = [
        ("Apple", ["iPad 11", "iPad Air 11", "iPad Air 13", "iPad Pro 11", "iPad Pro 13"]),
        ("Huawei", ["MatePad 11.5", "MatePad Pro 12.2", "MatePad Air", "MatePad SE"]),
        ("Xiaomi", ["Pad 7", "Pad 7 Pro", "Redmi Pad Pro", "Pad 6S Pro"]),
        ("Lenovo", ["拯救者 Y700", "小新 Pad Pro", "小新 Pad Plus", "Yoga Pad Pro"]),
        ("Samsung", ["Galaxy Tab S10", "Galaxy Tab S9 FE", "Galaxy Tab A9", "Galaxy Tab S10 Ultra"]),
        ("Honor", ["平板 9", "MagicPad 2", "平板 X9", "平板 GT Pro"]),
        ("OPPO", ["Pad 3", "Pad 3 Pro", "Pad Air 2"]),
        ("vivo", ["Pad3", "Pad3 Pro", "Pad Air"]),
    ]
    products = []
    index = 1
    for brand, models in brands:
        for model in models:
            tier = (index - 1) % 4
            tags = ["学习", "笔记", "学生", "送礼"]
            if tier >= 2:
                tags += ["高性能", "影音"]
            products.append(
                product(
                    f"tablet-{index:03d}",
                    f"{brand} {model} {['标准版', '手写套装', '大屏版', '旗舰套装'][tier]}",
                    "tablet",
                    brand,
                    1199 + tier * 1100 + (index % 3) * 150,
                    12 + (index * 6) % 70,
                    tags,
                    {
                        "screen": ["10.9 英寸 LCD", "11.5 英寸 2.8K", "12.2 英寸 OLED", "13 英寸 OLED"][tier],
                        "pen": "支持低延迟手写笔" if tier >= 1 else "可选手写笔",
                        "battery": f"{7600 + tier * 800}mAh",
                        "weight": f"{460 + tier * 35}g",
                        "storage": ["128GB", "256GB", "512GB", "1TB"][tier],
                    },
                    ["适合网课和笔记", "屏幕显示清晰", "配件生态完整", "便携性较好"],
                    "7 天无理由退换，1 年整机保修，手写笔和键盘按配件政策保修。",
                )
            )
            index += 1
    return products


def generate_earphone_products() -> list[dict[str, Any]]:
    brands = [
        ("Apple", ["AirPods 4", "AirPods Pro 2", "AirPods Max"]),
        ("Sony", ["WF-1000XM5", "WH-1000XM5", "LinkBuds S"]),
        ("Bose", ["QuietComfort Ultra Earbuds", "QuietComfort Headphones", "Ultra Open Earbuds"]),
        ("Huawei", ["FreeBuds Pro 4", "FreeClip", "FreeBuds SE 3"]),
        ("Xiaomi", ["Buds 5 Pro", "Buds 5", "Redmi Buds 6 Pro"]),
        ("OPPO", ["Enco X3", "Enco Free4", "Enco Air4 Pro"]),
        ("vivo", ["TWS 4", "TWS 4 Hi-Fi", "TWS Air2"]),
        ("JBL", ["Live Beam 3", "Tour Pro 2", "Tune Beam"]),
        ("Shokz", ["OpenRun Pro 2", "OpenFit Air", "OpenSwim Pro"]),
        ("Beats", ["Solo Buds", "Studio Buds+", "Fit Pro"]),
    ]
    products = []
    index = 1
    for brand, models in brands:
        for model in models:
            premium = index % 3 == 0
            sports = brand in {"Shokz", "JBL", "Beats"} or "Fit" in model or "Open" in model
            tags = ["降噪", "通勤", "送礼", "女生"]
            if sports:
                tags += ["运动", "防水"]
            if premium:
                tags += ["音质", "高端"]
            products.append(
                product(
                    f"earphone-{index:03d}",
                    f"{brand} {model} {['标准版', '降噪版', '旗舰版'][index % 3]}",
                    "earphone",
                    brand,
                    199 + (index % 3) * 500 + (index % 5) * 60,
                    20 + (index * 9) % 90,
                    tags,
                    {
                        "noise_control": f"{35 + (index % 4) * 5}dB 主动降噪" if not sports else "开放式环境感知",
                        "battery": f"{24 + (index % 5) * 6} 小时",
                        "waterproof": ["IPX4", "IP54", "IP55", "IP57"][index % 4],
                        "weight": f"{4.2 + (index % 5) * 0.4:.1f}g/只",
                        "codec": ["AAC", "LHDC", "LDAC", "aptX Adaptive"][index % 4],
                    },
                    ["佩戴舒适", "通话清晰", "续航覆盖日常通勤", "适合随身携带"],
                    "7 天无理由退换，1 年质保，耳塞套和充电线按配件政策处理。",
                )
            )
            index += 1
    return products


def generate_camera_products() -> list[dict[str, Any]]:
    brands = [
        ("Sony", ["ZV-E10 II", "A7C II", "A6700", "ZV-1 II"]),
        ("Canon", ["EOS R50", "EOS R8", "EOS R10", "PowerShot V10"]),
        ("Nikon", ["Z fc", "Z50 II", "Z5", "Z30"]),
        ("Fujifilm", ["X-S20", "X-T50", "X-M5", "X100VI"]),
        ("Panasonic", ["Lumix S9", "Lumix G100D", "Lumix GH7", "Lumix S5M2"]),
        ("DJI", ["Osmo Pocket 3", "Action 5 Pro", "Osmo Mobile 6", "RS 4 Mini"]),
        ("Insta360", ["Ace Pro 2", "X4", "GO 3S", "Flow Pro"]),
    ]
    products = []
    index = 1
    for brand, models in brands:
        for model in models:
            video_first = brand in {"DJI", "Panasonic"} or "ZV" in model or "V10" in model
            tags = ["拍摄", "旅行", "视频", "送礼"] if video_first else ["拍照", "旅行", "摄影", "高画质"]
            tier = (index - 1) % 4
            products.append(
                product(
                    f"camera-{index:03d}",
                    f"{brand} {model} {['机身', '套机', 'Vlog 套装', '创作套装'][tier]}",
                    "camera",
                    brand,
                    2299 + tier * 2600 + (index % 3) * 500,
                    6 + (index * 4) % 40,
                    tags,
                    {
                        "sensor": ["1 英寸", "APS-C", "全画幅", "4/3 画幅"][tier],
                        "video": ["4K 30fps", "4K 60fps", "6K 超采样", "4K 120fps"][tier],
                        "stabilization": ["电子防抖", "五轴防抖", "机身防抖", "云台防抖"][index % 4],
                        "weight": f"{300 + tier * 120 + (index % 3) * 30}g",
                        "lens": "可换镜头" if brand != "DJI" else "固定镜头/云台系统",
                    },
                    ["画质表现稳定", "视频规格适合创作", "机身便携", "适合旅行记录"],
                    "7 天无理由退换，1 年保修，镜头和电池等配件按品牌政策保修。",
                )
            )
            index += 1
    return products


def generate_watch_products() -> list[dict[str, Any]]:
    brands = [
        ("Apple", ["Watch SE", "Watch Series 10", "Watch Ultra 2"]),
        ("Huawei", ["Watch GT 5", "Watch GT 5 Pro", "Watch D2", "Watch Fit 3"]),
        ("Xiaomi", ["Watch S4", "Watch 2", "Redmi Watch 5", "Band 9 Pro"]),
        ("Garmin", ["Forerunner 265", "Venu 3", "Fenix 8", "Instinct 2X"]),
        ("Samsung", ["Galaxy Watch7", "Galaxy Watch Ultra", "Galaxy Fit3"]),
        ("Honor", ["Watch 5", "Watch GS 4", "Band 9"]),
        ("Amazfit", ["Balance", "Active", "T-Rex 3", "GTR 4"]),
        ("OPPO", ["Watch X", "Watch 4 Pro", "Band 2"]),
        ("vivo", ["Watch 3", "Watch GT", "Band 3"]),
        ("Fitbit", ["Charge 6", "Versa 4", "Sense 2"]),
    ]
    products = []
    index = 1
    for brand, models in brands:
        for model in models:
            sport = brand in {"Garmin", "Amazfit"} or "Ultra" in model or "T-Rex" in model
            tags = ["运动", "健康", "长续航", "送礼"]
            if sport:
                tags += ["户外", "高端"]
            if index % 4 == 0:
                tags.append("长辈")
            products.append(
                product(
                    f"smartwatch-{index:03d}",
                    f"{brand} {model} {['标准版', 'NFC 版', '蓝牙通话版', '旗舰版'][index % 4]}",
                    "smartwatch",
                    brand,
                    399 + (index % 4) * 650 + (index % 3) * 100,
                    16 + (index * 8) % 80,
                    tags,
                    {
                        "screen": ["1.32 英寸 AMOLED", "1.43 英寸 AMOLED", "1.5 英寸 AMOLED"][index % 3],
                        "battery": f"{3 + (index % 6) * 3} 天",
                        "health": "心率/血氧/睡眠/压力",
                        "waterproof": "5ATM",
                        "gps": "双频 GPS" if sport else "独立 GPS",
                    },
                    ["健康监测完整", "运动模式丰富", "续航适合日常", "佩戴轻便"],
                    "7 天无理由退换，1 年保修，表带等耗材按配件政策处理。",
                )
            )
            index += 1
    return products


def dedupe(products: list[dict[str, Any]]) -> list[dict[str, Any]]:
    seen = set()
    result = []
    for item in products:
        if item["id"] in seen:
            continue
        seen.add(item["id"])
        result.append(item)
    return result


PRODUCTS = dedupe(
    ANCHOR_PRODUCTS
    + generate_phone_products()
    + generate_laptop_products()
    + generate_tablet_products()
    + generate_earphone_products()
    + generate_camera_products()
    + generate_watch_products()
)
