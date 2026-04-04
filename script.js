const coreRegionsConfig = {
    "shexian": { name: "歙县" },
    "xiuning": { name: "休宁" },
    "yixian":  { name: "黟县" },
    "jixi":    { name: "绩溪" },
    "wuyuan":  { name: "婺源" },
    "qimen":   { name: "祁门" }
};

// 随机点的数据类别和生成的占位池
const archCategories = [
    { type: "residence", name: "民居", icon: "./icon/dwelling.svg" },
    { type: "office", name: "官衙", icon: "./icon/gov.svg" },
    { type: "bridge", name: "桥梁", icon: "./icon/bridge.svg" },
    { type: "shrine", name: "宗祠", icon: "./icon/gov.svg" } // 暂用gov复用宗祠
];
const bgArchData = {};

// 周边地区数据
const contextRegionsConfig = {
    "quzhou": { name: "衢州府" },
    "yanzhou": { name: "严州府" },
    "hangzhou": { name: "杭州府" },
    "ningguo": { name: "宁国府" },
    "guangxin": { name: "广信府" },
    "chizhou": { name: "池州府" },
    "raozhou": { name: "饶州府" }
};

// 首页装饰背景图配置 (供手动调整参数)
const bgDecorationConfig = {
    scale: 1.5,       // 放缩比例
    centerX: 420,     // 中心 X 坐标 (根据 SVG viewBox 宽度 758 居中预设)
    centerY: 410,     // 中心 Y 坐标 (根据 SVG viewBox 高度 821 居中预设)
    baseWidth: 900,   // 图片的基准渲染宽度（如果发现太小或太大可调整）
    baseHeight: 900   // 图片的基准渲染高度
};

// 预构件数据，模拟方案中的 JSON 结构
const huizhouData = {
    "shexian": { 
        title: "歙县·徽州府衙", subtitle: "Huizhou Prefecture Yamen", seal: "官衙", 
        dynasty: "明弘治年间", desc: "依山就势，粉墙黛瓦。建筑群采用轴线对称布局，展现了古代徽州成熟的砖木结构技艺，以及森严的封建礼制思想。作为古徽州的政治中心，其仪门、大堂等建筑保留了原汁原味的官式营造特征。",
        chart: [50, 30, 20]
    },
    "xiuning": { 
        title: "休宁·承启堂", subtitle: "Chengqi Hall, Xiuning", seal: "民居", 
        dynasty: "清乾隆年间", desc: "位于黄村，是典型的徽派古民居。宅内四水归堂的布局巧妙调和了采光与风水，精美的木雕牛腿讲述着休宁商人“贾而好儒”的历史渊源。",
        chart: [70, 20, 10]
    },
    "yixian":  { 
        title: "黟县·宏村月沼", subtitle: "Moon Lake, Hongcun Village", seal: "民居", 
        dynasty: "明永乐年间", desc: "宏村的牛形水系工程是徽州先民理水的巅峰之作。月沼作为半月形的中心水池，四周马头墙倒映水中，展现了中国传统“天人合一”的审美意境。",
        chart: [60, 25, 15]
    },
    "jixi":    { 
        title: "绩溪·龙川胡氏宗祠", subtitle: "Hu Family Ancestral Hall", seal: "宗祠", 
        dynasty: "明嘉靖年间", desc: "以木雕艺术闻名于世，被称为“木雕艺术博物馆”。其门楼、享堂及寝室的构件雕琢细腻，不仅是宗族礼制的空间载体，也是徽派雕刻技艺的集大成者。",
        chart: [85, 10, 5]
    },
    "wuyuan":  { 
        title: "婺源·彩虹桥", subtitle: "Rainbow Bridge, Wuyuan", seal: "桥梁", 
        dynasty: "南宋", desc: "古徽州最古老、最长的廊桥。建于清水的清华村，采用半船形桥墩设计以减轻洪水冲击，体现了极高的实用主义与古典结构美学的结合。",
        chart: [40, 0, 60] // 木、砖、石
    },
    "qimen":   { 
        title: "祁门·古戏台", subtitle: "Ancient Stage, Qimen", seal: "宗祠", 
        dynasty: "明清时期", desc: "散落于祁门各村落的古戏台，通常与宗祠结合。它们不仅是祭祀与娱乐的中心，其华丽的藻井和出挑的飞檐，正是徽派建筑极致繁华的缩影。",
        chart: [75, 15, 10]
    }
};

document.addEventListener("DOMContentLoaded", () => {
    const svgWrapper = document.getElementById("svg-wrapper");
    const introSection = document.getElementById("intro-section");
    const infoCard = document.getElementById("info-card");
    const closeBtn = document.getElementById("close-btn");

    fetch('./map.svg')
        .then(response => response.text())
        .then(svgContent => {
            const mapContainer = document.createElement("div");
            mapContainer.id = "map-3d-wrap";
            mapContainer.innerHTML = svgContent;

            const archHtmlLayer = document.createElement("div");
            archHtmlLayer.id = "html-arch-layer";
            mapContainer.appendChild(archHtmlLayer);
            
            svgWrapper.innerHTML = '';
            svgWrapper.appendChild(mapContainer);

            const svgElement = mapContainer.querySelector('svg');

            if(svgElement) {
                // 清理掉原SVG内可能存在的干扰class，确保CSS接管颜色
                const paths = svgElement.querySelectorAll("path");
                paths.forEach(p => p.removeAttribute("class"));

                // 取消 SVG 的 overflow: hidden，从而让背景图突破画布
                svgElement.style.overflow = "visible";

                // 插入底层装饰背景图 (保证作为第一层放入SVG内，即置于最底层)
                const bgImage = document.createElementNS("http://www.w3.org/2000/svg", "image");
                bgImage.setAttribute("href", "./background/background.png");
                const bgW = bgDecorationConfig.baseWidth * bgDecorationConfig.scale;
                const bgH = bgDecorationConfig.baseHeight * bgDecorationConfig.scale;
                bgImage.setAttribute("x", bgDecorationConfig.centerX - bgW / 2);
                bgImage.setAttribute("y", bgDecorationConfig.centerY - bgH / 2);
                bgImage.setAttribute("width", bgW);
                bgImage.setAttribute("height", bgH);
                bgImage.style.pointerEvents = "none";
                bgImage.style.mixBlendMode = "multiply"; // 使用正片叠底，使其与原本的底色自然融合

                // 将原本的直属子节点（整个地图层）包裹进组，并应用裁切防止显示生硬的框线
                const mapGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
                let defs = svgElement.querySelector("defs");
                if (!defs) {
                    defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
                    svgElement.prepend(defs);
                }
                const clipPath = document.createElementNS("http://www.w3.org/2000/svg", "clipPath");
                clipPath.setAttribute("id", "map-border-clip");
                const clipRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
                const vb = svgElement.viewBox && svgElement.viewBox.baseVal;
                const width = vb && vb.width ? vb.width : 757.5;
                const height = vb && vb.height ? vb.height : 821;
                // 裁掉边缘 1.5px 距离，使黑边彻底消失
                clipRect.setAttribute("x", "1.5");
                clipRect.setAttribute("y", "1.5");
                clipRect.setAttribute("width", width - 3);
                clipRect.setAttribute("height", height - 3);
                clipPath.appendChild(clipRect);
                defs.appendChild(clipPath);

                mapGroup.setAttribute("clip-path", "url(#map-border-clip)");

                // 把原来的原地图编组或节点塞进裁切组中
                Array.from(svgElement.childNodes).forEach(child => {
                    if (child.tagName && child.tagName.toLowerCase() !== 'defs' && child !== mapGroup) {
                        mapGroup.appendChild(child);
                    }
                });
                svgElement.insertBefore(mapGroup, svgElement.firstChild); // 放在图层最前面

                // 将背景纹理附加在原始线条与遮罩之上，不受地图边缘裁切限制
                svgElement.appendChild(bgImage);

                // 创建阴影编组，赋予整体外围描边阴影
                const coreShadowGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
                coreShadowGroup.setAttribute("id", "core-shadow-group");
                Object.keys(coreRegionsConfig).forEach(id => {
                    const el = document.getElementById(id);
                    if (el) coreShadowGroup.appendChild(el);
                });
                
                svgElement.appendChild(coreShadowGroup);

                applyTexturesToCoreRegions(svgElement, coreShadowGroup);

                generateLabels(svgElement);
                generateArchPoints(svgElement);
                setupSubMenu();
                setupTooltips();
                setupInteractions();
            }
        });

    function applyTexturesToCoreRegions(svgElement, coreShadowGroup) {
        // 使用固定种子生成伪随机数，确保每次刷新纹理截取位置固定
        let seed = 42;
        function seededRandom() {
            const x = Math.sin(seed++) * 10000;
            return x - Math.floor(x);
        }

        let defs = svgElement.querySelector("defs");
        if (!defs) {
            defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
            svgElement.prepend(defs);
        }

        Object.keys(coreRegionsConfig).forEach(id => {
            const el = document.getElementById(id);
            if (!el) return;

            // 根据固定种子生成背景平移参数截取不同部分的纹理
            const randomX = -Math.floor(seededRandom() * 150);
            const randomY = -Math.floor(seededRandom() * 150);

            const pattern = document.createElementNS("http://www.w3.org/2000/svg", "pattern");
            pattern.setAttribute("id", `texture-${id}`);
            pattern.setAttribute("patternUnits", "userSpaceOnUse");
            pattern.setAttribute("width", "1000");
            pattern.setAttribute("height", "1000");

            const image = document.createElementNS("http://www.w3.org/2000/svg", "image");
            image.setAttribute("href", "./background/background_texture.png");
            image.setAttribute("x", randomX);
            image.setAttribute("y", randomY);
            image.setAttribute("width", "1000");
            image.setAttribute("height", "1000");
            image.setAttribute("preserveAspectRatio", "xMidYMid slice");

            pattern.appendChild(image);
            defs.appendChild(pattern);

            // 克隆地形路径变成叠加纹理层，叠加在原来元素上方
            const overlay = el.cloneNode(true);
            overlay.removeAttribute("id");
            overlay.setAttribute("pointer-events", "none"); // 事件穿透，不影响原本元素的 hover 和 click
            overlay.style.mixBlendMode = "multiply"; // 水墨叠加融合模式
            overlay.style.opacity = "0.35";
            overlay.style.transition = "opacity 0.4s ease"; 

            overlay.setAttribute("fill", `url(#texture-${id})`);
            overlay.setAttribute("stroke", "none");
            const subPaths = overlay.querySelectorAll("path");
            subPaths.forEach(p => {
                p.setAttribute("fill", `url(#texture-${id})`);
                p.setAttribute("stroke", "none");
                p.removeAttribute("class");
                p.style = "";
            });

            // 紧贴在核心节点之后插入以实现 z-index 覆盖上方
            coreShadowGroup.insertBefore(overlay, el.nextSibling);
            el._textureOverlay = overlay; // 绑到元素本身方便后续调节不透明度
        });
    }

    function addViewportEdgeMask(svgElement) {
        const vb = svgElement.viewBox && svgElement.viewBox.baseVal;
        const width = vb && vb.width ? vb.width : 757.5;
        const height = vb && vb.height ? vb.height : 821;
        const thickness = 2.5;
        const bgColor = getComputedStyle(document.documentElement)
            .getPropertyValue("--bg-color")
            .trim() || "#F4F4F0";

        const maskGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
        maskGroup.setAttribute("id", "viewport-edge-mask");
        maskGroup.setAttribute("pointer-events", "none");

        const rectDefs = [
            { x: -thickness, y: -thickness, width: width + thickness * 2, height: thickness * 2 },
            { x: -thickness, y: height - thickness, width: width + thickness * 2, height: thickness * 2 },
            { x: -thickness, y: -thickness, width: thickness * 2, height: height + thickness * 2 },
            { x: width - thickness, y: -thickness, width: thickness * 2, height: height + thickness * 2 }
        ];

        rectDefs.forEach(def => {
            const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            rect.setAttribute("x", def.x);
            rect.setAttribute("y", def.y);
            rect.setAttribute("width", def.width);
            rect.setAttribute("height", def.height);
            rect.setAttribute("fill", bgColor);
            maskGroup.appendChild(rect);
        });

        svgElement.appendChild(maskGroup);
    }

    function setupInteractions() {
        const originalIntroText = introSection.innerHTML;
        let introHoverTimeout;

        // 关闭按钮逻辑
        closeBtn.addEventListener("click", () => {
            infoCard.classList.add("hidden");
            introSection.classList.remove("hidden");
            svgWrapper.classList.remove("is-focused");

            if (window.closeSubMenu) {
                window.closeSubMenu();
            }
            
            // 恢复所有区域样式
            Object.keys(coreRegionsConfig).forEach(id => {
                const el = document.getElementById(id);
                if(el) { 
                    el.style.opacity = '1'; 
                    if (el._textureOverlay) el._textureOverlay.style.opacity = '0.4';
                }
            });
            // 恢复试图缩放与3D倾斜设置
            // 为了维持高清抗锯齿，基础缩放值配合 CSS 修改为了 0.5
            svgWrapper.style.transform = "perspective(1200px) rotateX(0deg) rotateZ(0deg) scale(0.5) translate(0, 0)";
        });

        Object.keys(coreRegionsConfig).forEach(id => {
            const el = document.getElementById(id);
            if (!el) return;

            el.addEventListener("mouseenter", () => {
                if (infoCard.classList.contains("hidden")) {
                    const data = huizhouData[id];
                    if (data) {
                        clearTimeout(introHoverTimeout);
                        introSection.classList.add("fade-out");
                        introHoverTimeout = setTimeout(() => {
                            introSection.innerHTML = `<p><strong>${data.title}</strong></p><p>${data.desc}</p>`;
                            introSection.classList.remove("fade-out");
                        }, 250);
                    }
                }
            });

            el.addEventListener("mouseleave", () => {
                if (infoCard.classList.contains("hidden")) {
                    clearTimeout(introHoverTimeout);
                    introSection.classList.add("fade-out");
                    introHoverTimeout = setTimeout(() => {
                        introSection.innerHTML = originalIntroText;
                        introSection.classList.remove("fade-out");
                    }, 250);
                }
            });

            el.addEventListener("click", (e) => {
                // 1. 面板切换
                introSection.classList.add("hidden");
                infoCard.classList.remove("hidden");
                svgWrapper.classList.add("is-focused");

                // 打开始二级图鉴的随动子菜单
                if (window.openSubMenuForCounty) {
                    window.openSubMenuForCounty(id);
                }

                // 2. 更新数据
                updateCardInfo(id);

                // 3. 产生极其精细的 3D 视图与追踪聚焦
                const bbox = el.getBBox();
                const targetX = bbox.x + bbox.width / 2;
                const targetY = bbox.y + bbox.height / 2;
                
                // 原 SVG viewBox 大小 757.5 x 821，基准内部中心点坐标
                const cx = 378.75;
                const cy = 410.5;
                
                // SVG 在容器实际渲染高度已改为 180vh 保存抗锯齿，求换算系数
                const vhPerUnit = 180 / 821; 
                
                // 为了让任意县在任意缩放都能绝对居中，计算其对准 cx,cy 所需补足的平移全距离 (vh单位)
                const moveX = (cx - targetX) * vhPerUnit;
                const moveY = (cy - targetY) * vhPerUnit;

                // 为了把视觉焦点向右上调整，加入 X+20vh（往右移动画布）和 Y-15vh（往上移动画布）的补偿，使屏幕视角锁定在选定县的右上方
                // 同时把 scale 改为 1.15 倍（相当于原本 2.3 倍超大特写距），能让镜头拉得更近、特写更清晰
                svgWrapper.style.transform = `perspective(1200px) rotateX(48deg) rotateZ(-3deg) scale(1.15) translateX(${moveX + 24}vh) translateY(${moveY - 15}vh)`;

                // 4. 其他没选中的区域变暗和纹理变淡
                Object.keys(coreRegionsConfig).forEach(otherId => {
                    const otherEl = document.getElementById(otherId);
                    if (otherEl) {
                        otherEl.style.opacity = (otherId === id) ? '1' : '0.3'; 
                        if (otherEl._textureOverlay) {
                            otherEl._textureOverlay.style.opacity = (otherId === id) ? '0.75' : '0.2';
                        }
                    }
                });
            });
        });
    }

    function updateCardInfo(id) {
        const data = huizhouData[id];
        if(!data) return;

document.getElementById("card-county-seal").src = `./seal/${id}.png`;
        document.getElementById("card-title").textContent = data.title;
        document.getElementById("card-subtitle").textContent = data.subtitle;
        document.getElementById("card-dynasty").textContent = data.dynasty;
        document.getElementById("card-desc").textContent = data.desc;

        // 更新进度条数据动画
        const fills = document.querySelectorAll(".bar-fill");
        if(fills.length >= 3) {
            fills[0].style.width = '0%'; fills[1].style.width = '0%'; fills[2].style.width = '0%';
            setTimeout(() => {
                fills[0].style.width = data.chart[0] + '%';
                fills[1].style.width = data.chart[1] + '%';
                fills[2].style.width = data.chart[2] + '%';
            }, 100);
        }
    }

    // 绘制标签 (原有逻辑简化版)
    function generateLabels(svgElement) {
        // 首先绘制背景地名，不抢核心地界风头
        Object.keys(contextRegionsConfig).forEach(id => {
            const el = document.getElementById(id);
            if (!el) return;
            const bbox = el.getBBox();
            
            let x = bbox.x + bbox.width / 2;
            let y = bbox.y + bbox.height / 2;

            if (id === 'raozhou') {
                x -= 75;
            }

            const textHTML = `<text x="${x}" y="${y}" class="context-text svg-label" text-anchor="middle" dominant-baseline="central">${contextRegionsConfig[id].name}</text>`;
            // 将周边地名的标注放在最后，避免被地块的 fill 遮挡
            svgElement.insertAdjacentHTML('beforeend', textHTML); 
        });

        // 绘制一府六县地名
        Object.keys(coreRegionsConfig).forEach(id => {
            const el = document.getElementById(id);
            if (!el) return;
            const bbox = el.getBBox();
            
            let x = bbox.x + bbox.width / 2;
            let y = bbox.y + bbox.height / 2;
            // 微调祁门位置
            if (id === 'qimen') {
                x += 20;
                y += 10;
            }

            const textHTML = `<text x="${x}" y="${y}" class="core-text svg-label" text-anchor="middle" dominant-baseline="central">${coreRegionsConfig[id].name}</text>`;
            svgElement.insertAdjacentHTML('beforeend', textHTML);   

        });
    }

    function generateArchPoints(svgElement) {
        const archHtmlLayer = document.getElementById("html-arch-layer");

        let localSeed = 54321;
        function rand() {
            const x = Math.sin(localSeed++) * 10000;
            return x - Math.floor(x);
        }

        const vb = svgElement.viewBox && svgElement.viewBox.baseVal;    
        const viewBoxW = vb && vb.width ? vb.width : 757.5;
        const viewBoxH = vb && vb.height ? vb.height : 821;

        const svgPt = svgElement.createSVGPoint();

        Object.keys(coreRegionsConfig).forEach(countyId => {
            const pathEl = document.getElementById(countyId);
            if(!pathEl) return;
            
            bgArchData[countyId] = [];
            const bbox = pathEl.getBBox();
            
            // 为每个县生成随机数目的点
            const count = 12 + Math.floor(rand() * 8); 
            let attempts = 0;
            
            while(bgArchData[countyId].length < count && attempts < 1000) {
                attempts++;
                const x = bbox.x + rand() * bbox.width;
                const y = bbox.y + rand() * bbox.height;
                
                svgPt.x = x;
                svgPt.y = y;
                
                // 由于 pathEl 可能是 <g> 标签，而 isPointInFill 只在 SVGGeometryElement (<path>, <polygon>等) 上有效
                const geomElements = pathEl.tagName.toLowerCase() === 'g' 
                    ? Array.from(pathEl.querySelectorAll('path, polygon, rect')) 
                    : [pathEl];
                
                // 利用原生 isPointInFill 确保点严格在不规则区域边界内
                const isInside = geomElements.some(el => typeof el.isPointInFill === 'function' && el.isPointInFill(svgPt));

                if (isInside) {
                    const cat = archCategories[Math.floor(rand() * archCategories.length)];
                    const ptMeta = {
                        id: `${countyId}_${bgArchData[countyId].length}`,
                        county: countyId,
                        type: cat.type,
                        typeName: cat.name,
                        name: `${coreRegionsConfig[countyId].name}·${cat.name}${bgArchData[countyId].length + 1}`,
                        x: x,
                        y: y
                    };
                    bgArchData[countyId].push(ptMeta);

                    // 使用 HTML 渲染而不是 SVG 渲染，这样可以通过 CSS 的 3D TranslateZ 和 RotateX(-48deg) 完美垂直于摄影机
                    const baseSize = 40; 
                    const div = document.createElement("div");
                    div.style.backgroundImage = `url(${cat.icon})`;
                    div.style.backgroundSize = "contain";
                    div.style.backgroundRepeat = "no-repeat";
                    div.style.backgroundPosition = "bottom center";
                    
                    div.className = `arch-pt ${countyId} ${cat.type}`;
                    div.setAttribute("data-id", ptMeta.id);
                    div.setAttribute("data-county", countyId);
                    
                    // 将坐标从 viewBox 系转换到百分比布局系
                    const leftPercent = (x / viewBoxW) * 100;
                    const topPercent = (y / viewBoxH) * 100;
                    
                    div.style.position = "absolute";
                    div.style.left = `${leftPercent}%`;
                    div.style.top = `${topPercent}%`;
                    div.style.width = `${baseSize}px`;
                    div.style.height = `${baseSize}px`;
                    // 将中心点定在元素的底部居中
                    div.style.transformOrigin = "bottom center";
                    // 用 margin 修正对齐到底部中心点，而不是左上角
                    div.style.marginLeft = `-${baseSize / 2}px`;
                    div.style.marginTop = `-${baseSize}px`;
                    div.style.display = "block"; // 默认显示为一级总体图鉴的状态

                    archHtmlLayer.appendChild(div);
                }
            }
        });
    }

    function setupSubMenu() {
        const tabs = document.querySelectorAll(".nav-tabs button");
        const subNavPanel = document.getElementById("sub-nav-panel");
        const subNavClose = document.getElementById("sub-nav-close");
        const subNavList = document.getElementById("sub-nav-list");
        const subNavTitle = document.getElementById("sub-nav-title");

        window.currentFocusCounty = null;
        
        window.openSubMenuForCounty = function(countyId) {
            window.currentFocusCounty = countyId;
            const activeTab = document.querySelector(".nav-tabs button.active");
            if(activeTab) {
                activeTab.click(); 
            } else {
                tabs[0].click();
            }
        };
        
        window.closeSubMenu = function() {
            if(subNavPanel) subNavPanel.classList.remove("active");
            window.currentFocusCounty = null;
            // 回归一级图鉴时，根据当前顶部的 tab 筛选
            const activeTab = document.querySelector(".nav-tabs button.active");
            let _type = "all";
            if (activeTab) _type = activeTab.getAttribute("data-type");

            document.querySelectorAll(".arch-pt").forEach(pt => {
                if (_type === "all" || pt.classList.contains(_type)) {
                    pt.style.display = "block";
                } else {
                    pt.style.display = "none";
                }
            });
        }

        if(subNavClose) {
            subNavClose.addEventListener("click", () => {
                window.closeSubMenu();
            });
        }

        tabs.forEach(tab => {
            tab.addEventListener("click", (e) => {
                tabs.forEach(t => t.classList.remove("active"));
                tab.classList.add("active");
                
                const type = tab.getAttribute("data-type"); 
                
                if(window.currentFocusCounty) {
                    subNavPanel.classList.add("active");
                    let list = bgArchData[window.currentFocusCounty] || [];
                    if(type !== "all") {
                        list = list.filter(item => item.type === type);
                    }
                    
                    const typeName = type === "all" ? "全部点位" : archCategories.find(c => c.type === type).name;
                    subNavTitle.textContent = `${coreRegionsConfig[window.currentFocusCounty].name} · ${typeName}`;
                    
                    subNavList.innerHTML = "";
                    list.forEach(item => {
                        const li = document.createElement("li");
                        li.innerHTML = `<span>${item.typeName}</span> ${item.name}`;
                        li.addEventListener("mouseenter", () => highlightPoint(item.id));
                        li.addEventListener("mouseleave", () => unhighlightPoint(item.id));
                        subNavList.appendChild(li);
                    });
                    
                    document.querySelectorAll(".arch-pt").forEach(pt => {
                        if (pt.classList.contains(window.currentFocusCounty)) {
                            if (type === "all" || pt.classList.contains(type)) {
                                pt.style.display = "block";
                            } else {
                                pt.style.display = "none";
                            }
                        } else {
                            pt.style.display = "none"; 
                        }
                    });
                } else {
                    document.querySelectorAll(".arch-pt").forEach(pt => {
                        pt.style.display = "none";
                    });
                }
            });
        });
    }

    function setupTooltips() {
        const tooltip = document.getElementById("arch-tooltip");
        const svgWrapper = document.getElementById("svg-wrapper");
        if(!tooltip || !svgWrapper) return;
        
        svgWrapper.addEventListener("mousemove", (e) => {
            // Note: SVG events trigger on the DOM element within the SVG namespace
            if(e.target.classList && e.target.classList.contains("arch-pt")) {
                const id = e.target.getAttribute("data-id");
                let meta;
                for(let c in bgArchData) {
                    meta = bgArchData[c].find(i => i.id === id);
                    if(meta) break;
                }
                if(meta) {
                    tooltip.textContent = meta.name;
                    tooltip.classList.remove("hidden");
                    tooltip.classList.add("visible");
                    
                    tooltip.style.left = `${e.clientX}px`;
                    tooltip.style.top = `${e.clientY - 15}px`;
                }
            } else {
                tooltip.classList.add("hidden");
                tooltip.classList.remove("visible");
            }
        });
    }

    function highlightPoint(id) {
        const pt = document.querySelector(`.arch-pt[data-id="${id}"]`);
        if(pt) {
            pt.classList.add("is-highlighted");
        }
    }

    function unhighlightPoint(id) {
        const pt = document.querySelector(`.arch-pt[data-id="${id}"]`);
        if(pt) {
            pt.classList.remove("is-highlighted");
        }
    }
});
