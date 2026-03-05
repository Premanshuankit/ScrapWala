const ScrapListing = require('../model/ScrapListing')
const SCRAP_TYPES = require('../config/scrapTypes')
const logger = require('../utils/logger')
const mongoose = require('mongoose')

const createListing = async (req, res) => {
    try {
        // Get buyerId from authenticated user
        const buyerId = req.userId
        console.log("buyerId:", buyerId)
        logger.info("buyerId:", buyerId)

        const { scrapType, ratePerKg } = req.body
        // const { scrapType, ratePerKg, minimumQuantity } = req.body

        // Basic validation
        if (!scrapType || !ratePerKg) {
            return res.status(400).json({
                message: "scrapType, ratePerKg are required"
            })
        }

        if (ratePerKg <= 0) {
            return res.status(400).json({
                message: "ratePerKg must be greater than 0"
            })
        }

        // Check if listing exists
        const existingListing = await ScrapListing.findOne({
            buyerId,
            scrapType: scrapType.toLowerCase(),
        });

        if (existingListing) {
            // UPDATE instead of 409
            existingListing.ratePerKg = ratePerKg;
            await existingListing.save();

            return res.status(200).json({
                message: "Listing updated successfully",
                data: existingListing,
            });
        }

        // CREATE if not exists
        const listing = await ScrapListing.create({
            buyerId,
            scrapType: scrapType.toLowerCase(),
            ratePerKg,
        });

        return res.status(201).json({ message: "Listing created successfully", data: listing })

    } catch (error) {
        return res.status(500).json({ message: "Server error", error: error.message
        })
    }
}

const getAllListing = async (req, res) => {
  try {
    const loggedInUserId = req.userId;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const shopname = req.query.shopname?.trim() || "";
    const scrapType = req.query.scrapType?.trim() || "";
    const firstname = req.query.firstname?.trim() || "";
    const city = req.query.city?.trim() || "";
    const pincode = req.query.pincode?.trim() || "";

    const skip = (page - 1) * limit;

    const baseMatch = { isActive: true };

    if (scrapType) {
      baseMatch.scrapType = scrapType;
    }

    const pipeline = [
      { $match: baseMatch },

      {
        $lookup: {
          from: "users",
          localField: "buyerId",
          foreignField: "_id",
          as: "buyer",
        },
      },

      { $unwind: "$buyer" },

      {
        $match: {
          "buyer._id": { $ne: new mongoose.Types.ObjectId(loggedInUserId) }
        }
      },

      // Apply shopname + firstname  + city + pincode filters
      ...(shopname || firstname || city || pincode
        ? [
            {
              $match: {
                ...(shopname && {
                  "buyer.shopname": {
                    $regex: shopname,
                    $options: "i",
                  },
                }),
                ...(firstname && {
                  "buyer.firstname": {
                    $regex: firstname,
                    $options: "i",
                  },
                }),
                ...(city && {
                  "buyer.address.city": {
                    $regex: city,
                    $options: "i",
                  },
                }),
                ...(pincode && {
                  "buyer.address.pincode": {
                    $regex: pincode,
                    $options: "i",
                  },
                }),
              },
            },
          ]
        : []),

      { $sort: { createdAt: -1 } },

      {
        $facet: {
          data: [
            { $skip: skip },
            { $limit: limit },
          ],
          totalCount: [{ $count: "count" }],
        },
      },
    ];

    const result = await ScrapListing.aggregate(pipeline);

    const listings = result[0]?.data || [];
    const totalItems = result[0]?.totalCount[0]?.count || 0;
    const totalPages = Math.ceil(totalItems / limit);

    console.log("PAGE:", page);
    console.log("TOTAL ITEMS:", totalItems);
    console.log("TOTAL PAGES:", totalPages);

    res.json({
      data: listings,
      currentPage: page,
      totalPages,
      totalItems,
    });

  } catch (error) {
    console.error("GET LISTING ERROR:", error);
    res.status(500).json({ message: "Server error getAllListing" });
  }
};

const getAllListingByBuyerId = async (req, res) => {

    try {
        const { buyerId } = req.params

        if (!buyerId) {
            return res.status(400).json({
                message: "buyerId parameter by ID is required"
            })
        }

        const scrapListings = await ScrapListing.find({ buyerId })
        if (!scrapListings.length) {
            return res.status(404).json({
                message: "No Scrap Listings found for this buyer"
            })
        }
        return res.json(scrapListings)

    } catch (error) {
        return res.status(500).json({
            message: "Server error",
            error: error.message
        })
    }
}

const updateListing = async (req, res) => {
    const { id } = req.params
    const { ratePerKg } = req.body
    if ( !id || !ratePerKg ) {
        return res.status(400).json({ 'message': 'ID parameter and ratePerKg is required'})
    }

    const listing = await ScrapListing.findById(id).exec()
    if (!listing) {
        return res.status(404).json({
            message: `No listing matches ID ${id}`
        })
    }
    // if (req.body?.ratePerKg) listing.ratePerKg = req.body.ratePerKg;
    listing.ratePerKg = ratePerKg
    const result = await listing.save()
    res.json(result);
}

const createAllListing = async (req, res) => {
    try {

        const buyerId = req.userId

        const existingListings = await ScrapListing.find({ buyerId })
        const existingTypes = existingListings.map(l => l.scrapType)

        const listingsToCreate = SCRAP_TYPES
            .filter(item => !existingTypes.includes(item.type))
            .map(item => ({
                buyerId,
                scrapType: item.type,
                ratePerKg: item.defaultRate
            }))

        if (listingsToCreate.length > 0) {
            await ScrapListing.insertMany(listingsToCreate)
        }

        const allListings = await ScrapListing.find({ buyerId })

        return res.json({
            message: "Scrap catalog initialized successfully",
            total: allListings.length,
            data: allListings
        })

    } catch (error) {
        return res.status(500).json({
            message: "Server error",
            error: error.message
        })
    }
}

module.exports = { createListing, getAllListing, getAllListingByBuyerId, updateListing, createAllListing } 
