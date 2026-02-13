const model = require('../../model/admin/faq')

module.exports.AddFaq = async (req, res) => {
    try {

        const { Faq_question, Faq_answer } = req.body

        if (!Faq_question || !Faq_answer) {
            return res.send({
                result: false,
                message: "Faq question and Faq answer are required"
            })
        }

        const checkfaq = await model.Checkfaqquestion(Faq_question)
        if (checkfaq.length > 0) {
            return res.send({
                result: true,
                message: "This faq is already added"
            })
        }

        const addFaq = await model.AddFaq(Faq_question, Faq_answer)

        if (addFaq.affectedRows > 0) {
            return res.send({
                result: true,
                message: "Faq added successfully"
            })
        } else {
            return res.send({
                result: false,
                message: "Failed to add Faq. Please try again."
            })
        }

    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })
    }
}

module.exports.ListFaq = async (req, res) => {
    try {
        const Faqs = await model.ListFaq();

        // if (Faqs.length == 0) {
        //     return res.send({
        //         result: false,
        //         message: "failed to fetch faq list"
        //     });
        // }

        return res.send({
            result: true,
            message: "Data retrieved successfully",
            data: Faqs
        });

    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        });
    }
};


module.exports.EditFaq = async (req, res) => {

    try {

        const { faq_id, Faq_question, Faq_answer } = req.body

        if (!faq_id) {
            return res.send({
                result: false,
                message: "Faq id is required"
            })
        }

        const CheckFaq = await model.CheckFaq(faq_id)
        if (CheckFaq.length == 0) {
            return res.send({
                result: false,
                message: "Faq not found."
            })
        }

        let updates = []
        if (Faq_question !== undefined) updates.push(`faq_question = '${Faq_question}'`)
        if (Faq_answer !== undefined) updates.push(`faq_answer = '${Faq_answer}'`)

        if (updates.length > 0) {
            const updateString = updates.join(',');
            const updated = await model.UpdateFaq(updateString, faq_id)

            if (updated.affectedRows === 0) {
                return res.send({
                    result: false,
                    message: "Failed to update Faq details"
                })
            }
        }

        return res.send({
            result: true,
            message: "Faq details updated successfully"
        })

    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })
    }
}

module.exports.DeleteFaq = async (req, res) => {
    try {
        let faq_id = req.query.faq_id

        if (!faq_id) {
            return res.send({
                result: false,
                message: "Faq details id is required"
            })
        }
        const checkPlan = await model.CheckFaq(faq_id)

        if (checkPlan.length === 0) {
            return res.send({
                result: false,
                message: "Faq details not found"
            })
        }
        const deleted = await model.DeleteFaq(faq_id)
        if (deleted.affectedRows > 0) {
            return res.send({
                result: true,
                message: "Faq details deleted successfully"
            })
        } else {
            return res.send({
                result: false,
                message: "Failed to delete Faq details"
            })
        }
    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })
    }
}
