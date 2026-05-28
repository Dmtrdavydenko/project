//class CircularChart {
//    constructor({
//        size = 220,
//        strokeWidth = 24,
//        radius = 80,
//        data = [],
//        container = null,
//        showLabels = true,
//        showCenterText = true,
//        centerText = '',
//        rotate = -90
//    } = {}) {

//        this.size = size;
//        this.strokeWidth = strokeWidth;
//        this.radius = radius;
//        this.data = data;
//        this.container = container;
//        this.showLabels = showLabels;
//        this.showCenterText = showCenterText;
//        this.centerText = centerText;
//        this.rotate = rotate;

//        this.circumference = 2 * Math.PI * this.radius;

//        this.colors = [
//            '#3b82f6',
//            '#10b981',
//            '#f59e0b',
//            '#ef4444',
//            '#8b5cf6',
//            '#06b6d4',
//            '#84cc16',
//            '#ec4899',
//            '#f97316',
//            '#14b8a6'
//        ];
//    }

//    total() {
//        return this.data.reduce((sum, item) => sum + item.value, 0);
//    }

//    percent(value) {
//        return (value / this.total()) * 100;
//    }

//    createSVG() {

//        const svgNS = 'http://www.w3.org/2000/svg';

//        const svg = document.createElementNS(svgNS, 'svg');

//        svg.setAttribute('width', this.size);
//        svg.setAttribute('height', this.size);
//        svg.setAttribute(
//            'viewBox',
//            `0 0 ${this.size} ${this.size}`
//        );

//        const center = this.size / 2;

//        const rootGroup = document.createElementNS(svgNS, 'g');

//        rootGroup.setAttribute(
//            'transform',
//            `rotate(${this.rotate} ${center} ${center})`
//        );

//        let offset = 0;

//        this.data.forEach((item, index) => {

//            const percent = this.percent(item.value);

//            const dash =
//                (percent / 100) * this.circumference;

//            const circle =
//                document.createElementNS(svgNS, 'circle');

//            circle.setAttribute('cx', center);
//            circle.setAttribute('cy', center);
//            circle.setAttribute('r', this.radius);

//            circle.setAttribute('fill', 'none');

//            circle.setAttribute(
//                'stroke',
//                item.color || this.colors[index % this.colors.length]
//            );

//            circle.setAttribute(
//                'stroke-width',
//                this.strokeWidth
//            );

//            circle.setAttribute(
//                'stroke-dasharray',
//                `${dash} ${this.circumference - dash}`
//            );

//            circle.setAttribute(
//                'stroke-dashoffset',
//                -offset
//            );

//            circle.setAttribute(
//                'stroke-linecap',
//                'butt'
//            );

//            rootGroup.appendChild(circle);

//            offset += dash;
//        });

//        svg.appendChild(rootGroup);

//        if (this.showCenterText) {

//            const text =
//                document.createElementNS(svgNS, 'text');

//            text.setAttribute('x', center);
//            text.setAttribute('y', center);

//            text.setAttribute('text-anchor', 'middle');

//            text.setAttribute('dominant-baseline', 'middle');

//            text.setAttribute('font-size', '18');

//            text.setAttribute('font-weight', 'bold');

//            text.textContent =
//                this.centerText || this.total();

//            svg.appendChild(text);
//        }

//        return svg;
//    }

//    createLegend() {

//        const legend =
//            document.createElement('div');

//        legend.className = 'chart-legend';

//        this.data.forEach((item, index) => {

//            const row =
//                document.createElement('div');

//            row.style.display = 'flex';
//            row.style.alignItems = 'center';
//            row.style.gap = '8px';
//            row.style.marginBottom = '6px';

//            const color =
//                item.color || this.colors[index % this.colors.length];

//            const box =
//                document.createElement('div');

//            box.style.width = '14px';
//            box.style.height = '14px';
//            box.style.borderRadius = '50%';
//            box.style.background = color;

//            const text =
//                document.createElement('div');

//            const percent =
//                this.percent(item.value).toFixed(1);

//            text.innerHTML =
//                `<b>${item.label}</b> : ${item.value} (${percent}%)`;

//            row.appendChild(box);
//            row.appendChild(text);

//            legend.appendChild(row);
//        });

//        return legend;
//    }

//    render() {

//        if (!this.container) {
//            throw new Error('container not specified');
//        }

//        const wrapper =
//            document.createElement('div');

//        wrapper.style.display = 'flex';
//        wrapper.style.alignItems = 'center';
//        wrapper.style.gap = '30px';

//        wrapper.appendChild(this.createSVG());

//        if (this.showLabels) {
//            wrapper.appendChild(this.createLegend());
//        }

//        this.container.appendChild(wrapper);
//    }
//}
class CircularChart {

    constructor({
        container,
        data,
        size = 260,
        radius = 90,
        strokeWidth = 34,
        centerText = ''
    }) {

        this.container = container;
        this.data = data;

        this.size = size;
        this.radius = radius;
        this.strokeWidth = strokeWidth;
        this.centerText = centerText;

        this.circumference =
            2 * Math.PI * radius;

        this.colors = [
            '#3b82f6',
            '#10b981',
            '#f59e0b',
            '#ef4444',
            '#8b5cf6',
            '#06b6d4',
            '#84cc16',
            '#ec4899',
            '#f97316',
            '#14b8a6',
            '#eab308',
            '#0ea5e9'
        ];
    }

    total() {

        return this.data.reduce(
            (sum, item) => sum + item.value,
            0
        );
    }

    percent(value) {

        return (
            value / this.total()
        ) * 100;
    }

    createSVG() {

        const svgNS =
            'http://www.w3.org/2000/svg';

        const svg =
            document.createElementNS(svgNS, 'svg');

        svg.setAttribute('width', this.size);
        svg.setAttribute('height', this.size);

        const center = this.size / 2;

        const group =
            document.createElementNS(svgNS, 'g');

        group.setAttribute(
            'transform',
            `rotate(-90 ${center} ${center})`
        );

        let offset = 0;

        this.data.forEach((item, index) => {

            const percent =
                this.percent(item.value);

            const dash =
                (percent / 100) *
                this.circumference;

            const circle =
                document.createElementNS(svgNS, 'circle');

            circle.setAttribute('cx', center);
            circle.setAttribute('cy', center);
            circle.setAttribute('r', this.radius);

            circle.setAttribute('fill', 'none');

            circle.setAttribute(
                'stroke',
                this.colors[index % this.colors.length]
            );

            circle.setAttribute(
                'stroke-width',
                this.strokeWidth
            );

            circle.setAttribute(
                'stroke-dasharray',
                `${dash} ${this.circumference - dash}`
            );

            circle.setAttribute(
                'stroke-dashoffset',
                -offset
            );

            offset += dash;

            group.appendChild(circle);
        });

        svg.appendChild(group);

        const text =
            document.createElementNS(svgNS, 'text');

        text.setAttribute('x', center);
        text.setAttribute('y', center);

        text.setAttribute('text-anchor', 'middle');

        text.setAttribute(
            'dominant-baseline',
            'middle'
        );

        text.setAttribute(
            'font-size',
            '18'
        );

        text.setAttribute(
            'font-weight',
            'bold'
        );

        text.textContent = this.centerText;

        svg.appendChild(text);

        return svg;
    }

    createLegend() {

        const legend =
            document.createElement('div');

        this.data.forEach((item, index) => {

            const row =
                document.createElement('div');

            row.className = 'legend-row';

            const color =
                document.createElement('div');

            color.className = 'legend-color';

            color.style.background =
                this.colors[index % this.colors.length];

            const percent =
                this.percent(item.value)
                    .toFixed(1);

            const text =
                document.createElement('div');

            text.innerHTML =
                `<b>${item.label}</b><br>
                     ${item.value.toLocaleString()}
                     (${percent}%)`;

            row.appendChild(color);
            row.appendChild(text);

            legend.appendChild(row);
        });

        return legend;
    }

    render() {

        const wrap =
            document.createElement('div');

        wrap.className = 'chart-wrap';

        wrap.appendChild(
            this.createSVG()
        );

        wrap.appendChild(
            this.createLegend()
        );

        this.container.appendChild(wrap);
    }
}