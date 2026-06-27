const selectTableName = document.createElement("select");
selectTableName.name = "name";
selectTableName.id = "name";
selectTableName.autocomplete = 'off';
selectTableName.addEventListener('change', loadTable);
main.append(selectTableName);
async function getTableName() {
    try {
        const response = await fetch("https://worktime.up.railway.app/app", {
            method: "POST",
            headers: {
                "Content-Type": "application/json;charset=utf-8",
            },
            body: JSON.stringify({
                action: "getAllTableNames"
            }),
        });
        const result = await response.json();
        if (Array.isArray(result)) {
            createSelectOptions(result);
        } else {
            console.log("Expected an array but got:", result);
        }
        return result;
    } catch (error) {
        console.log("Error fetching table names:", error);
    }

}
function createSelectOptions(dataArray) {
    selectTableName.innerHTML = '';
    dataArray.forEach(item => {
        const option = document.createElement('option');
        option.value = item.value;
        option.textContent = item.value;
        option.dataset.isParent = item.isParent;
        selectTableName.appendChild(option);
    });
}
async function loadTable() {
    const ans = await request();
    const result = ans.data;
    console.log(result);

    const container = document.getElementById('table-container');
    container.innerHTML = '';


    function renderForm(schema) {
        const form = document.createElement('form');

        Object.entries(schema).forEach(([name, field]) => {


            if (field.COLUMN_KEY === 'PRI') return;

            const wrapper = document.createElement('div');

            const label = document.createElement('label');
            label.textContent = name;

            let input;

            if (field.type === 'select') {
                input = document.createElement('select');
                input.name = name;

                field.options.forEach(opt => {
                    const option = document.createElement('option');
                    option.value = opt.value;
                    option.textContent = opt.label;
                    input.appendChild(option);
                });

            } else {
                input = document.createElement('input');
                input.name = name;

                if (field.DATA_TYPE === 'number') {
                    input.type = 'number';

                    // авто min/max
                    if (field.COLUMN_TYPE.includes('decimal')) {
                        input.min = 0;
                        input.max = 255;
                        input.step = 0.1;
                    }

                    if (field.COLUMN_TYPE.includes('smallint')) {
                        input.min = 0;
                        input.max = 65535;
                    }

                } else {
                    input.type = 'text';
                }
            }

            wrapper.appendChild(label);
            wrapper.appendChild(input);

            form.appendChild(wrapper);
        });

        // submit
        const btn = document.createElement('button');
        btn.type = 'submit';
        btn.textContent = 'Сохранить';
        form.appendChild(btn);

        // обработка отправки
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = new FormData(form);
            const result = {};

            for (let [key, value] of formData.entries()) {
                result[key] = Number(value);
            }

            try {
                const response = await fetch('/api/tape/insert', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(result)
                });

                const data = await response.json();

                console.log('Ответ сервера:', data);

                if (response.ok) {
                    alert('Сохранено!');
                    form.reset();
                } else {
                    alert('Ошибка: ' + data.message);
                }

            } catch (err) {
                console.error('Ошибка запроса:', err);
                alert('Ошибка сети');
            }
        });

        return form;
    }


    const formContainer = document.getElementById('form-container');
    formContainer.innerHTML = '';

    if (result.rows && Array.isArray(result.rows) && result.rows.length > 0) {
        if (selectTableName.value === "user_endpoints") {
            result.rows.forEach(row => {
                if (row.last_visit) {
                    row.last_visit = new Date(row.last_visit).toLocaleString();
                }
            });
        }
        const table = createTable(result.rows);
        //if (selectTableName.value === "tape_length") {
        //    formContainer.appendChild(renderForm(result.k));
        //}
        //if (selectTableName.value === "looms") {
        //    myfilter(result.rows);
        //}
        //if (selectTableName.value === "TapeExtrusion") {
        //    await generateFormTape();
        //}
        //if (selectTableName.value === "manual") {
        //    table.addEventListener("click", selectTable);
        //    await generateForm();
        //} else {
        //    table.addEventListener("click", queryTarget);
        //}

        const spanTableName = document.createElement("span");
        spanTableName.textContent = selectTableName.value;
        container.appendChild(spanTableName);
        container.appendChild(document.createElement("hr"));
        container.appendChild(table);
        //await getTypeTableHeder();
        //await getTypeKey();
    } else {
        //formContainer.appendChild(renderForm(result.k));

        container.textContent = "Empty";
    }

}
(async () => {
    const tableName = await getTableName();
    console.log(tableName);
    await loadTable();
})();