const model = require('../../model/admin/locations')

module.exports.AddCountry = async (req, res) => {
    try {

        const { country_name } = req.body

        if (!country_name) {
            return res.send({
                result: false,
                message: "country name is required"
            })
        }

        const checkCountry = await model.CheckCountryname(country_name)
        if (checkCountry.length > 0) {
            return res.send({
                result: true,
                message: "This Country is already added"
            })
        }

        const addCountry = await model.AddCountry(country_name)

        if (addCountry.affectedRows > 0) {
            return res.send({
                result: true,
                message: "Country added successfully"
            })
        } else {
            return res.send({
                result: false,
                message: "Failed to add Country. Please try again."
            })
        }

    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })
    }
}

module.exports.AddState = async (req, res) => {
    try {

        const { country_id, state_name } = req.body

        if (!country_id || !state_name) {
            return res.send({
                result: false,
                message: "state name and country id are required"
            })
        }

        const checkstate = await model.CheckStatename(state_name)
        if (checkstate.length > 0) {
            return res.send({
                result: true,
                message: "This state name is already added"
            })
        }

        const addstate = await model.AddState(country_id, state_name)

        if (addstate.affectedRows > 0) {
            return res.send({
                result: true,
                message: "State added successfully"
            })
        } else {
            return res.send({
                result: false,
                message: "Failed to add state. Please try again."
            })
        }

    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })
    }
}

module.exports.AddDistrict = async (req, res) => {
    try {

        const { country_id, state_id, district_name } = req.body

        if (!state_id || !district_name) {
            return res.send({
                result: false,
                message: "district name and state id are required"
            })
        }

        const checkdistrict = await model.CheckDistrictname(district_name)
        if (checkdistrict.length > 0) {
            return res.send({
                result: true,
                message: "This district name is already added"
            })
        }

        const adddistrict = await model.AddDistrict(country_id, state_id, district_name)

        if (adddistrict.affectedRows > 0) {
            return res.send({
                result: true,
                message: "District added successfully"
            })
        } else {
            return res.send({
                result: false,
                message: "Failed to add district. Please try again."
            })
        }

    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })
    }
}

module.exports.ListCountry = async (req, res) => {
    try {
        const Countrys = await model.ListCountry();

        if (Countrys.length == 0) {
            return res.send({
                result: false,
                message: "failed to fetch Country list",
                data:[]
            });
        }

        return res.send({
            result: true,
            message: "Data retrieved successfully",
            data: Countrys
        });

    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        });
    }
};

module.exports.ListStates = async (req, res) => {
    try {
        let country_id = req.query.country_id

        if (!country_id) {
            return res.send({
                result: false,
                message: "country id is required"
            });
        }

        const states = await model.ListStates(country_id);

        // if (states.length == 0) {
        //     return res.send({
        //         result: false,
        //         message: "failed to fetch states list",
        //         data:[]
        //     });
        // }

        return res.send({
            result: true,
            message: "Data retrieved successfully",
            data: states
        });

    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        });
    }
};

module.exports.ListDistricts = async (req, res) => {
    try {

        let state_id = req.query.state_id
        let filter = req.query.filter
        if (!state_id) {
            return res.send({
                result: false,
                message: "state id is required"
            });
        }
        if (filter) {
            const Districts = await model.ListAllDistricts();
            if (Districts.length == 0) {
                return res.send({
                    result: false,
                    message: "failed to fetch all district list",
                    data:[]
                });
            }

            return res.send({
                result: true,
                message: "Data retrieved successfully",
                data: Districts
            });

        }
        const Districts = await model.ListDistricts(state_id);

        if (Districts.length == 0) {
            return res.send({
                result: false,
                message: "failed to fetch district list"
            });
        }

        return res.send({
            result: true,
            message: "Data retrieved successfully",
            data: Districts
        });

    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        });
    }
}

module.exports.EditCountry = async (req, res) => {

    try {

        const { country_id, country_name } = req.body

        if (!country_id) {
            return res.send({
                result: false,
                message: "Country id is required"
            })
        }

        const CheckCountry = await model.CheckCountry(country_id)
        if (CheckCountry.length == 0) {
            return res.send({
                result: false,
                message: "Country not found."
            })
        }

        let updates = []
        if (country_name !== undefined) updates.push(`country_name = '${country_name}'`)

        if (updates.length > 0) {
            const updateString = updates.join(',');
            const updated = await model.UpdateCountry(updateString, country_id)

            if (updated.affectedRows === 0) {
                return res.send({
                    result: false,
                    message: "Failed to update Country details"
                })
            }
        }

        return res.send({
            result: true,
            message: "Country details updated successfully"
        })

    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })
    }
}

module.exports.EditStates = async (req, res) => {

    try {
        const { state_id, country_id, state_name } = req.body

        if (!state_id) {
            return res.send({
                result: false,
                message: "state id is required"
            })
        }

        const Checkstate = await model.CheckState(state_id)
        if (Checkstate.length == 0) {
            return res.send({
                result: false,
                message: "State not found."
            })
        }

        let updates = []
        if (country_id !== undefined) updates.push(`state_country_id = '${country_id}'`)
        if (state_name !== undefined) updates.push(`state_name = '${state_name}'`)


        if (updates.length > 0) {
            const updateString = updates.join(',');
            const updated = await model.UpdateStates(updateString, state_id)

            if (updated.affectedRows === 0) {
                return res.send({
                    result: false,
                    message: "Failed to update state details"
                })
            }
        }

        return res.send({
            result: true,
            message: "state details updated successfully"
        })

    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })
    }
}

module.exports.EditDitricts = async (req, res) => {

    try {
        const { district_id, state_id, country_id, district_name } = req.body

        if (!district_id) {
            return res.send({
                result: false,
                message: "Districts id is required"
            })
        }

        const Checkstate = await model.CheckDistricts(district_id)
        if (Checkstate.length == 0) {
            return res.send({
                result: false,
                message: "Districts not found."
            })
        }

        let updates = []
        if (country_id !== undefined) updates.push(`district_country_id = '${country_id}'`)
        if (state_id !== undefined) updates.push(`district_state_id = '${state_id}'`)
        if (district_name !== undefined) updates.push(`district_name = '${district_name}'`)

        if (updates.length > 0) {
            const updateString = updates.join(',');
            const updated = await model.UpdateDistricts(updateString, district_id)

            if (updated.affectedRows === 0) {
                return res.send({
                    result: false,
                    message: "Failed to update Districts details"
                })
            }
        }

        return res.send({
            result: true,
            message: "Districts details updated successfully"
        })

    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })
    }
}

module.exports.DeleteCountry = async (req, res) => {
    try {
        let country_id = req.query.country_id

        if (!country_id) {
            return res.send({
                result: false,
                message: "Country details id is required"
            })
        }
        const checkPlan = await model.CheckCountry(country_id)

        if (checkPlan.length === 0) {
            return res.send({
                result: false,
                message: "Country details not found"
            })
        }
        const deleted = await model.DeleteCountry(country_id)
        if (deleted.affectedRows > 0) {
            return res.send({
                result: true,
                message: "Country details and all related states and districts deleted successfully"
            });
        } else {
            return res.send({
                result: false,
                message: "Failed to delete Country details"
            });
        }
    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })
    }
}

module.exports.DeleteStates = async (req, res) => {
    try {
        let state_id = req.query.state_id

        if (!state_id) {
            return res.send({
                result: false,
                message: "state details id is required"
            })
        }
        const checkPlan = await model.CheckState(state_id)

        if (checkPlan.length === 0) {
            return res.send({
                result: false,
                message: "state details not found"
            })
        }
        const deleted = await model.DeleteStates(state_id)
        if (deleted.affectedRows > 0) {
            return res.send({
                result: true,
                message: "State and all related districts deleted successfully"
            });
        } else {
            return res.send({
                result: false,
                message: "Failed to delete state details"
            });
        }
    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })
    }
}

module.exports.DeleteDistricts = async (req, res) => {
    try {
        let district_id = req.query.district_id

        if (!district_id) {
            return res.send({
                result: false,
                message: "Districts details id is required"
            })
        }
        const checkPlan = await model.CheckDistricts(district_id)

        if (checkPlan.length === 0) {
            return res.send({
                result: false,
                message: "Districts details not found"
            })
        }
        const deleted = await model.DeleteDistricts(district_id)
        if (deleted.affectedRows > 0) {
            return res.send({
                result: true,
                message: "Districts details deleted successfully"
            })
        } else {
            return res.send({
                result: false,
                message: "Failed to delete Districts details"
            })
        }
    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })
    }
}