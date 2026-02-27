const User = require('../model/User');

const getAllBuyers = async (req, res) => {
    try {
        const buyers = await User.find({
            "roles.Buyer": { $exists: true }
        })
        .select("_id username firstname lastname address")
        .lean();

        return res.status(200).json(buyers);
    } catch (err) {
        return res.status(500).json({ message: "Failed to fetch buyers", error: err.message });
    }
};

module.exports = { getAllBuyers };