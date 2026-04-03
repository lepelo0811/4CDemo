const coreRegionsConfig = {
    "shexian": { name: "歙县" },
    "xiuning": { name: "休宁" },
    "yixian":  { name: "黟县" },
    "jixi":    { name: "绩溪" },
    "wuyuan":  { name: "婺源" },
    "qimen":   { name: "祁门" }
};

const huizhouData = {
    "shexian": { title: "歙县·徽州府衙", subtitle: "Huizhou Prefecture Yamen, Shexian" },
    "xiuning": { title: "休宁·承启堂", subtitle: "Chengqi Hall, Xiuning" },
    "yixian":  { title: "黟县·宏村", subtitle: "Hongcun Village, Yixian" },
    "jixi":    { title: "绩溪·胡氏宗祠", subtitle: "Hu Family Ancestral Hall, Jixi" },
    "wuyuan":  { title: "婺源·篁岭", subtitle: "Huangling, Wuyuan" },
    "qimen":   { title: "祁门·古戏台", subtitle: "Ancient Stage, Qimen" }
};

document.addEventListener("DOMContentLoaded", () => {
    const svgWrapper = document.getElementById("svg-wrapper");
    const infoCard = document.getElementById("info-card");
    const closeBtn = document.getElementById("close-btn");

    fetch('./map.svg')
        .then(response => response.text())
        .then(svgContent => {
            svgWrapper.innerHTML = svgContent;
            const svgElement = svgWrapper.querySelector('svg');
            
            if(svgElement) {
                // 新增：自动在边缘画上与背景同色的遮罩矩形，盖住黑线
                addEdgeCovers(svgElement); 
                generateIndependentFilters(svgElement);
                generateLabels(svgElement);
                setupInteractions();
            }
        });

    // 核心修复逻辑：动态读取 SVG 画板边界，画四条纯色“胶布”盖住画板线框
    function addEdgeCovers(svgElement) {
        const coverGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
        coverGroup.setAttribute("pointer-events", "none"); // 防止遮挡下方点击
        
        // 读取原图大小，如果读不到则使用你在问题1提供的默认宽高
        const vb = svgElement.viewBox.baseVal;
        const w = vb ? vb.width : 757.5;
        const h = vb ? vb.height : 821;
        
        const coverThickness = 12; // 遮罩厚度
        const bgColor = "#f8f6f0"; // 网页背景色
        
        // 定义四周的四个矩形遮罩
        const edges = [
            { x: -coverThickness, y: -coverThickness, width: w + coverThickness * 2, height: coverThickness * 2 }, // 上
            { x: -coverThickness, y: h - coverThickness, width: w + coverThickness * 2, height: coverThickness * 2 }, // 下
            { x: -coverThickness, y: -coverThickness, width: coverThickness * 2, height: h + coverThickness * 2 }, // 左
            { x: w - coverThickness, y: -coverThickness, width: coverThickness * 2, height: h + coverThickness * 2 } // 右
        ];
        
        edges.forEach(rect => {
            const r = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            r.setAttribute("x", rect.x);
            r.setAttribute("y", rect.y);
            r.setAttribute("width", rect.width);
            r.setAttribute("height", rect.height);
            r.setAttribute("fill", bgColor);
            coverGroup.appendChild(r);
        });
        
        svgElement.appendChild(coverGroup);
    }

    function generateIndependentFilters(svgElement) {
        let defs = svgElement.querySelector('defs');
        if (!defs) {
            defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
            svgElement.insertBefore(defs, svgElement.firstChild);
        }

        Object.keys(coreRegionsConfig).forEach((id, index) => {
            const filterId = `ink-wash-${id}`;
            const uniqueSeed = index * 53 + 24; 
            const animDuration = 15 + index * 3; 

            const filterHTML = `
                <filter id="${filterId}" x="-20%" y="-20%" width="140%" height="140%">
                    <feTurbulence type="fractalNoise" baseFrequency="0.007" numOctaves="5" seed="${uniqueSeed}" result="noise">
                        <animate attributeName="baseFrequency" values="0.007; 0.01; 0.007" dur="${animDuration}s" repeatCount="indefinite" />
                    </feTurbulence>
                    <feComponentTransfer in="noise" result="highContrastNoise">
                        <feFuncA type="linear" slope="1.8" intercept="-0.3"/>
                    </feComponentTransfer>
                    <feColorMatrix type="matrix" values="0 0 0 0 0.15  0 0 0 0 0.15  0 0 0 0 0.15  0 0 0 0.8 0" in="highContrastNoise" result="inkColor" />
                    <feComposite operator="in" in="inkColor" in2="SourceGraphic" result="maskedInk" />
                    <feBlend mode="multiply" in="SourceGraphic" in2="maskedInk" />
                </filter>
            `;
            defs.insertAdjacentHTML('beforeend', filterHTML);

            const pathEl = document.getElementById(id);
            if (pathEl) {
                pathEl.style.filter = `url(#${filterId})`;
            }
        });
    }

    function generateLabels(svgElement) {
        const textLayer = document.createElementNS("http://www.w3.org/2000/svg", "g");
        textLayer.setAttribute("id", "labels-layer");

        Object.keys(coreRegionsConfig).forEach(id => {
            const pathEl = document.getElementById(id);
            if (pathEl) {
                const bbox = pathEl.getBBox();
                let x = bbox.x + bbox.width / 2;
                let y = bbox.y + bbox.height / 2;

                if (id === 'qimen') {
                    x += 20; 
                    y += 10;
                }

                const textEl = document.createElementNS("http://www.w3.org/2000/svg", "text");
                textEl.textContent = coreRegionsConfig[id].name;
                textEl.setAttribute("x", x);
                textEl.setAttribute("y", y);
                textEl.setAttribute("class", "svg-label core-text");

                textLayer.appendChild(textEl);
            }
        });
        
        svgElement.appendChild(textLayer);
    }

    function setupInteractions() {
        const coreRegions = Object.keys(coreRegionsConfig);
        
        coreRegions.forEach(id => {
            const el = document.getElementById(id);
            if (!el) return;

            el.addEventListener("click", (e) => {
                coreRegions.forEach(r => document.getElementById(r)?.classList.remove("active-region"));
                el.classList.add("active-region");

                const data = huizhouData[id];
                if (data) {
                    document.getElementById("card-title").textContent = data.title;
                    document.getElementById("card-subtitle").textContent = data.subtitle;
                    infoCard.classList.remove("hidden");
                }
                e.stopPropagation();
            });
        });

        document.getElementById("svg-wrapper").addEventListener("click", hideCard);
        closeBtn.addEventListener("click", (e) => { hideCard(); e.stopPropagation(); });
    }

    function hideCard() {
        infoCard.classList.add("hidden");
        Object.keys(coreRegionsConfig).forEach(r => document.getElementById(r)?.classList.remove("active-region"));
    }
});