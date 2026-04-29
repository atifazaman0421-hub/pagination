const expensetable=require("../Models/expensetrackertable")
const sequelize = require("../Utils/db-connection");
const { Op } = require("sequelize");

const addlist=async(req,res)=>{
  const t = await sequelize.transaction();
    try {
        const {typeSelect,category,title,amount}=req.body
        const data=await expensetable.create({
            typeSelect,
            category,
            title,
            amount,
            userId: req.user.id
        },{
          transaction:t
        })
        await t.commit();
        res.status(201).json(data)
    } catch (error) {
        await t.rollback();
        console.log(error)
        res.status(500).json({ message: "Failed to add expense" });
    }
}



const getlist = async (req, res) => {
  try {
    const { filter, date, search, typeSelect } = req.query;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    let whereClause = {
      userId: req.user.id
    };

    // ✅ FILTER BY TYPE (IMPORTANT FIX)
    if (typeSelect) {
      whereClause.typeSelect = typeSelect;
    }

    // ✅ SEARCH
    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { category: { [Op.like]: `%${search}%` } }
      ];
    }

    // ✅ DATE FILTER
    if (date && filter) {
      const selectedDate = new Date(Number(date));
      const y = selectedDate.getFullYear();
      const m = selectedDate.getMonth();
      const d = selectedDate.getDate();

      if (filter === "daily") {
        whereClause.createdAt = {
          [Op.between]: [
            new Date(y, m, d, 0, 0, 0, 0),
            new Date(y, m, d, 23, 59, 59, 999)
          ]
        };
      } else if (filter === "monthly") {
        whereClause.createdAt = {
          [Op.between]: [
            new Date(y, m, 1),
            new Date(y, m + 1, 0, 23, 59, 59, 999)
          ]
        };
      } else if (filter === "yearly") {
        whereClause.createdAt = {
          [Op.between]: [
            new Date(y, 0, 1),
            new Date(y, 11, 31, 23, 59, 59, 999)
          ]
        };
      }
    }

    const { count, rows } = await expensetable.findAndCountAll({
      where: whereClause,
      order: [["createdAt", "DESC"]],
      limit,
      offset
    });

    res.status(200).json({
      transactions: rows,
      currentPage: page,
      totalPages: Math.ceil(count / limit),
      totalItems: count
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to get expense" });
  }
};

const updatelist=async(req,res)=>{
  const t = await sequelize.transaction();
    try {
        const {id}=req.params
        const {category,title,amount}=req.body

         const existing = await expensetable.findByPk(id, { transaction: t });
    if (!existing) {
        await t.rollback();
      return res.status(404).json({ message: "Data not found" });
    }

        await expensetable.update({
            category,
            title,
            amount
        },{
            where:{
                id:id
            }, transaction: t })

        const updatedData = await expensetable.findByPk(id, { transaction: t });
        
        await t.commit();
        res.status(200).json(updatedData)
    } catch (error) {
      await t.rollback();
        console.log(error)
        res.status(500).json({ message: "Failed to update expense" });
    }
}

const deletelist=async(req,res)=>{
  const t = await sequelize.transaction();
    try {
        const {id}=req.params
       const deleted = await expensetable.destroy({ where: { id },transaction: t });

if (!deleted) {
  await t.rollback();
  return res.status(404).json({ message: "Data not found" });
}

        await t.commit();
        res.status(200).json({ message: "Deleted successfully" });
    } catch (error) {
        await t.rollback();
        console.log(error)
        res.status(500).json({ message: "Failed to get expense" });
    }
}

const getTotals = async (req, res) => {
  try {
    const { filter, date, search } = req.query;

    let whereClause = {
      userId: req.user.id
    };

    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { category: { [Op.like]: `%${search}%` } }
      ];
    }

    // same date filter logic here...

    const data = await expensetable.findAll({ where: whereClause });

    let totalIncome = 0;
    let totalExpense = 0;

    data.forEach(item => {
      if (item.typeSelect === "income") {
        totalIncome += Number(item.amount);
      } else {
        totalExpense += Number(item.amount);
      }
    });

    res.json({
      totalIncome,
      totalExpense
    });

  } catch (error) {
    res.status(500).json({ message: "Failed to get totals" });
  }
};
module.exports={
    addlist,
    getlist,
    updatelist,
    deletelist,
    getTotals
}