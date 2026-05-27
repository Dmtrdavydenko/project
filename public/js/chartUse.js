const warpData = [
    {
        label: '90 белая нет',
        value: 31352358.10
    },
    {
        label: '90 белая светостаб',
        value: 6797216.59
    },
    {
        label: '140 цветная',
        value: 15975550.80
    },
    {
        label: '220 белая',
        value: 3795792.19
    }
];

const chart = new CircularChart({
    container: document.getElementById('app'),

    size: 320,

    radius: 110,

    strokeWidth: 42,

    centerText: 'Warp',

    data: warpData
});

chart.render();