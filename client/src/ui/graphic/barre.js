export const Barre = {
    chart: null, // Instance du graphique
    option: null, // Options du graphique

    init: function() {
        const chartDom = document.getElementById('barre');
        
        this.chart = echarts.init(chartDom, null, {
            renderer: 'canvas',
            useDirtyRect: false
        });

        // Options initiales du graphique
        this.option = {
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow' // 'shadow' as default; can also be 'line' or 'shadow'
                }
            },
            legend: {},
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            },
            xAxis: {
                type: 'value'
            },
            yAxis: {
                type: 'category',
                data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
            },
            
            series: [
                {
                    name: 'Post-bac',
                    type: 'bar',
                    stack: 'total',
                    label: {
                        show: true
                    },
                    emphasis: {
                        focus: 'series'
                    },
                    data: [320, 302, 301, 334, 390, 330, 320]
                },
                {
                    name: 'Général',
                    type: 'bar',
                    stack: 'total',
                    label: {
                        show: true
                    },
                    emphasis: {
                        focus: 'series'
                    },
                    data: [120, 132, 101, 134, 90, 230, 210]
                },
                {
                    name: 'Sti2d',
                    type: 'bar',
                    stack: 'total',
                    label: {
                        show: true
                    },
                    emphasis: {
                        focus: 'series'
                    },
                    data: [220, 182, 191, 234, 290, 330, 310]
                },
                {
                    name: 'Autres',
                    type: 'bar',
                    stack: 'total',
                    label: {
                        show: true
                    },
                    emphasis: {
                        focus: 'series'
                    },
                    data: [150, 212, 201, 154, 190, 330, 410]
                }
            ]
        };

        if (this.option && typeof this.option === 'object') {
            this.chart.setOption(this.option);
        }

        window.addEventListener('resize', () => {
            this.chart.resize();
        });
        
    },

    updateData: function(newYAxisData, postbac, general, sti2d, autres) {
        // Vérifiez que 'option' est bien initialisé

        
        if (!this.option) {
            console.error("Erreur : 'option' n'est pas encore initialisé.");
            return;
        }
        
        // Vérifiez que 'series' est correctement défini
        if (!this.option.series || !this.option.series[0]) {
            console.error("Erreur : 'series' n'est pas correctement définie dans l'option.");
            return;
        }
    
        // Assurez-vous que toutes les données sont des tableaux valides
        if (!Array.isArray(postbac) || !Array.isArray(general) || !Array.isArray(sti2d) || !Array.isArray(autres)) {
            console.error("Erreur : Les données fournies ne sont pas des tableaux valides.");
            return;
        }
    
        if (!Array.isArray(newYAxisData)) {
            console.error("Erreur : 'newYAxisData' n'est pas un tableau valide.");
            return;
        }
    
        // Calculer le total des candidatures pour chaque jour
        const totalCandidatures = postbac.map((_, index) => {
            return (postbac[index] || 0) + (general[index] || 0) + (sti2d[index] || 0) + (autres[index] || 0);
        });
    
        // Créer un tableau d'objets pour trier les jours en fonction du total des candidatures
        const sortedData = newYAxisData.map((day, index) => {
            return {
                day: day,
                total: totalCandidatures[index],
                postbac: postbac[index] || 0,
                general: general[index] || 0,
                sti2d: sti2d[index] || 0,
                autres: autres[index] || 0
            };
        }).sort((a, b) => b.total - a.total);
    
        // Mettre à jour les données triées
        this.option.yAxis.data = sortedData.map(item => item.day);
        this.option.series[0].data = sortedData.map(item => item.postbac);
        this.option.series[1].data = sortedData.map(item => item.general);
        this.option.series[2].data = sortedData.map(item => item.sti2d);
        this.option.series[3].data = sortedData.map(item => item.autres);
    
        // Réappliquer l'option mise à jour
        this.chart.setOption(this.option, true);
    
        // Forcer un rafraîchissement du graphique après la mise à jour des données
        this.chart.resize();
    }
    
};

