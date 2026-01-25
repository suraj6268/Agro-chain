const Admin = require('../models/Admin');

const seedAdmin = async () => {
    try {
        const existingAdmin = await Admin.findOne({ email: 'admin@agrochain.com' });

        if (!existingAdmin) {
            const admin = new Admin({
                email: 'admin@agrochain.com',
                password: 'admin123',
                name: 'Admin'
            });
            await admin.save();
            console.log('Default admin created: admin@agrochain.com / admin123');
        }
    } catch (error) {
        console.error('Error seeding admin:', error);
    }
};

module.exports = seedAdmin;
