(function() {
    $(document).ready(function() {
        // form submit
        $('form').submit(function(event) {
            event.preventDefault();

            $.post('/add', $('form').serialize())
                .done(function(data) {
                    console.log(data);
                    getList();
                })
                .fail(function(data) {
                    console.error(data);
                });
        });

        // get list data
        getList();
        function getList() {
            $.get('/list', function(data) {
                if (data.code === 0) {
                    let list = JSON.parse(data.list);
                    let content = '';
                    list.map(function(item, index) {
                        content += `<div class="row">
                            <p>${item.name}</p>
                            <p>${item['center-cost']}</p>
                            <p>${item.money}</p>
                        </div>`;
                    })
                    $('#list-body').empty().append(content);
                } else {
                    console.error(`list error : `);
                }
            });
        }

        // export
        $('.export').on('click', function(e) {
            $.get('/export', function(data) {
                if (data.code !== 0) {
                    alert(data.message);
                    return false;
                }

                console.log('export: ', data);
                window.location.href = `/${data.path}`;
            });

            return false;
        });

        // wipe data 
        $('.clear').on('click', function(e) {
            $.post('/wipeData')
                .done(function(data) {
                    if (data && data.code === 0) {
                        getList();
                    }
                })
        });
    })
})();
