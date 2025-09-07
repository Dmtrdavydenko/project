const mysql = require('mysql2/promise');
class ManualRepository {
    constructor(pool) {
        //this.pool = mysql.createPool({
        //    host: process.env.DB_HOST,
        //    user: process.env.DB_USER,
        //    password: process.env.DB_PASSWORD,
        //    database: process.env.DB_NAME,
        //    waitForConnections: true,
        //    connectionLimit: 10,
        //    queueLimit: 0
        //});
        this.pool = pool;
    }

    /**
     * Валидация данных перед вставкой
     */
    validateManualData(data) {
        const requiredFields = [
            'type_id', 'sleeve_w_d_id', 'yarn_id', 'quantity',
            'thread_densiti_id', 'color_id', 'additive_id'
        ];

        // Проверка наличия всех обязательных полей
        requiredFields.forEach(field => {
            if (data[field] === undefined || data[field] === null) {
                throw new Error(`Missing required field: ${field}`);
            }
        });

        // Валидация числовых значений (0-255)
        Object.keys(data).forEach(key => {
            const value = data[key];
            if (typeof value !== 'number' || value < 0 || value > 255) {
                throw new Error(`Invalid value for ${key}: must be number between 0-255`);
            }
        });

        return true;
    }
    _buildWhereClause(filters) {
        const requiredFields = [
            'type_id', 'sleeve_w_d_id', 'yarn_id', 'quantity',
            'thread_densiti_id', 'color_id', 'additive_id'
        ];

        const conditions = [];
        const values = [];

        // Перебираем только разрешённые поля
        for (const field of requiredFields) {
            if (filters[field] !== undefined && filters[field] !== null && filters[field] !== '') {
                // Предполагаем, что все значения числовые (как в валидации), но если есть строки — добавьте экранирование
                conditions.push(`\`${field}\` = ?`);
                values.push(filters[field]);
            }
        }

        return {
            whereClause: conditions.length ? `WHERE ${conditions.join(' AND ')}` : '',
            values: values
        };
    }
    async select(filters = {}) {
        try {
            const connection = await this.pool.getConnection();

            try {
                const { whereClause, values } = this._buildWhereClause(filters);
                const query = `
                SELECT
                t.type_id,
                sw.sleeve_width,
                d.density,
                type.yarn_name,
                CASE
                    WHEN type.yarn_name = "warp" THEN warp.warp_quantity
                    WHEN type.yarn_name = "weft" THEN weft.weft_quantity
                    ELSE NULL
                END AS calculated_quantity,
                thread.thread_density,
                c.color,
                ad.additive_name,
                t.created_at,
                t.updated_at
                FROM \`manual\` t
                JOIN sleeve_width_density swd
                    ON t.sleeve_w_d_id = swd.sleeve_width_density_id
                JOIN sleeve_width sw
                    ON swd.sleeve_width_id = sw.sleeve_width_id
                JOIN sleeve_density d
                    ON swd.sleeve_density_id = d.sleeve_density_id
                JOIN Thread_Parameters thread
                    ON t.thread_densiti_id = thread.thread_id
                JOIN color c
                    ON t.color_id = c.color_id
                JOIN additive ad
                    ON t.additive_id = ad.id
                LEFT JOIN warp_quantity warp
                    ON t.quantity = warp.warp_id
                LEFT JOIN weft_quantity weft
                    ON t.quantity = weft.weft_id
                JOIN yarn_type type
                    ON t.yarn_id = type.yarn_id
                ${whereClause};
                `;






                console.log(query, values);
                const [rows] = await connection.execute(query, values);
                return {
                    success: true,
                    rows: rows
                };
            } finally {
                connection.release();
            }
        } catch (error) {
            console.error('Error selecting manual data:', error);
            throw new Error(`Database operation failed: ${error.message}`);

        }
    }

    /**
     * Вставка данных в таблицу manual
     */
    async insertManual(data) {
        try {
            // Валидация данных
            this.validateManualData(data);

            const connection = await this.pool.getConnection();

            try {
                const query = `
                INSERT INTO \`manual\` (
                    \`type_id\`, \`sleeve_w_d_id\`, \`yarn_id\`, \`quantity\`,
                    \`thread_densiti_id\`, \`color_id\`, \`additive_id\`
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
                    ON DUPLICATE KEY UPDATE quantity = VALUES(quantity)
                `;

                const values = [
                    data.type_id,
                    data.sleeve_w_d_id,
                    data.yarn_id,
                    data.quantity,
                    data.thread_densiti_id,
                    data.color_id,
                    data.additive_id
                ];

                const [result] = await connection.execute(query, values);

                return {
                    success: true,
                    insertId: result.insertId,
                    affectedRows: result.affectedRows
                };
            } finally {
                connection.release();
            }
        } catch (error) {
            console.error('Error inserting manual data:', error);
            throw new Error(`Database operation failed: ${error.message}`);
        }
    }

    /**
     * Пакетная вставка данных
     */
    async insertMultipleManuals(dataArray) {
        const connection = await this.pool.getConnection();

        try {
            await connection.beginTransaction();

            const results = [];
            for (const data of dataArray) {
                try {
                    this.validateManualData(data);
                    const result = await this.insertManual(data);
                    results.push(result);
                } catch (error) {
                    await connection.rollback();
                    throw error;
                }
            }

            await connection.commit();
            return results;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }
}

async function Usage() {
    const repository = new ManualRepository();

    const manualData = {
        type_id: 10,
        sleeve_w_d_id: 20,
        yarn_id: 30,
        quantity: 5,
        thread_densiti_id: 15,
        color_id: 25,
        additive_id: 35
    };
    let o = {
        type: 1,
        sleeve_width_density: 17,
        yarn_type: 1,
        warp_quantity: 1,
        Thread_Parameters: 2,
        color: 1,
        additive: 2
    }

    try {
        const result = await repository.insertManual(manualData);
        console.log('Data inserted successfully:', result);
    } catch (error) {
        console.error('Insert failed:', error.message);
    }
}
module.exports = ManualRepository;