const model = require('../../model/admin/habit')

module.exports.AddHabit = async (req, res) => {
    try {

        const { habit_name, habit_options } = req.body

        if (!habit_name || !habit_options) {
            return res.send({
                result: false,
                message: "Habit name and habit options are required"
            })
        }

        const checkhabbit = await model.CheckHabbitname(habit_name)
        if (checkhabbit.length > 0) {
            return res.send({
                result: true,
                message: "This habbit is already added"
            })
        }

        const addHabit = await model.AddHabit(habit_name, habit_options)

        if (addHabit.affectedRows > 0) {
            return res.send({
                result: true,
                message: "Habit added successfully"
            })
        } else {
            return res.send({
                result: false,
                message: "Failed to add Habit. Please try again."
            })
        }

    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })
    }
}

module.exports.ListHabit = async (req, res) => {
    try {
        const habits = await model.ListHabit();

        const formattedHabits = habits.map(habit => {
            const optionsArray = habit.h_options
                ? habit.h_options.split(',').map(opt => opt.trim())
                : [];

            return {
                h_id: habit.h_id,
                h_name: habit.h_name,
                options: optionsArray
            };
        });

        return res.send({
            result: true,
            message: "Data retrieved successfully",
            data: formattedHabits
        });

    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        });
    }
};


module.exports.EditHabit = async (req, res) => {

    try {

        const { h_id, habit_name, habit_options } = req.body

        if (!h_id) {
            return res.send({
                result: false,
                message: "Habit id is required"
            })
        }

        const checkPlan = await model.CheckHabit(h_id)
        if (checkPlan.length === 0) {
            return res.send({
                result: false,
                message: "Habit not found."
            })
        }

        let updates = []
        if (habit_name !== undefined) updates.push(`h_name = '${habit_name}'`)
        if (habit_options !== undefined) updates.push(`h_options = '${habit_options}'`)

        if (updates.length > 0) {
            const updateString = updates.join(',');
            const updated = await model.UpdateHabit(updateString, h_id)

            if (updated.affectedRows === 0) {
                return res.send({
                    result: false,
                    message: "Failed to update Habit details"
                })
            }
        }

        return res.send({
            result: true,
            message: "Habit details updated successfully"
        })

    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })
    }
}

module.exports.DeleteHabit = async (req, res) => {
    try {
        let h_id = req.query.h_id

        if (!h_id) {
            return res.send({
                result: false,
                message: "Habit details id is required"
            })
        }
        const checkPlan = await model.CheckHabit(h_id)

        if (checkPlan.length === 0) {
            return res.send({
                result: false,
                message: "Habit details not found"
            })
        }
        const deleted = await model.DeleteHabit(h_id)
        if (deleted.affectedRows > 0) {
            return res.send({
                result: true,
                message: "Habit details deleted successfully"
            })
        } else {
            return res.send({
                result: false,
                message: "Failed to delete Habit details"
            })
        }
    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })
    }
}
