const express = require('express');
const app = express();
 const cron = require('node-cron');
const hbs = require(`hbs`)
const port = process.env.PORT || 11000;
const path = require(`path`);
const bodyParser = require('body-parser');
require("../src/db/conn");
const idgen = require("../src/models/register");
const { v4: uuidv4 } = require('uuid');

//public static path
const static_path= path.join(__dirname, "../public");
const template_path= path.join(__dirname, "../tamplates/views") 
const partials_path = path.join(__dirname, "../templates/partials")
// Middleware
app.use(express.json());
app.use(express.urlencoded({extended:false}))
app.use(express.static(static_path));
app.use(bodyParser.json())

app.set(`view engine`, `hbs`);
app.set(`views`, template_path);
hbs.registerPartials(partials_path);


//routing
app.get (``, (req , res)=>{
res.send("index")
})
app.get (`/indexx`, (req , res)=>{
res.send("indexx")
})

app.get (`/login`, (req , res)=>{
res.sendFile(path.join(static_path, 'login.html'))
})

app.get('/vip', (req, res) => {
  const vipuserId = req.query.vipuserId;
  if (!vipuserId) {
    return res.status(400).send('Invalid user ID');
  }
  res.sendFile(path.join(static_path, 'vip.html')); // Serve the static VIP page
});
app.get('/Home', (req, res) => {
  res.sendFile(path.join(static_path, 'home.html'))
})
app.get('/index', (req, res) => {
  res.send('index');
});
app.get('/Mine', (req, res) => {
  res.sendFile(path.join(static_path, 'mine.html'))
})
app.get('/Income', (req, res) => {
  res.sendFile(path.join(static_path, 'income.html'))
});
app.get('/Connection', (req, res) => {
  res.sendFile(path.join(static_path, 'connection.html'))
});
app.get('/About', (req, res) => {
  res.sendFile(path.join(static_path, 'about.html'))
});
app.get('/withdraw', (req, res) => {
  res.sendFile(path.join(static_path, 'withdraw.html'))
});
app.get('/test', (req, res) => {
  res.sendFile(path.join(static_path, 'test.html'))
});
app.get('/deposit', (req, res) => {
  res.sendFile(path.join(static_path, 'deposit.html'))
});
app.get('/team', (req, res) => {
  res.sendFile(path.join(static_path, 'team.html'))
});
app.get('/Event', (req, res) => {
  res.sendFile(path.join(static_path, 'event.html'))
});
app.get('/Record', (req, res) => {
  res.sendFile(path.join(static_path, 'record.html'))
});
app.get('/Logout', (req, res) => {
  res.sendFile(path.join(static_path, 'index.html'))
});
app.get('/usdt', (req, res) => {
  res.sendFile(path.join(static_path, 'usdt.html'))
});
app.get('/exchange', (req, res) => {
  res.sendFile(path.join(static_path, 'exchange.html'))
});
app.get('/notice', (req, res) => {
  res.sendFile(path.join(static_path, 'notice.html'))
});
app.get('/api/checkUserId', async (req, res) => {
    const { userId } = req.query;
    if (!userId) {
        return res.status(400).json({ exists: false });
    }
    const user = await idgen.findOne({ userId });
    res.json({ exists: !!user });
});
app.get('/user-data', async (req, res) => {
    const { userId } = req.query;

    try {
        // Find the user by userId
        const user = await idgen.findOne({ userId });

        if (user) {
            // Send the latest score, electronic value, and total withdrawn
            res.json({ 
                success: true, 
                score: user.score || 0, 
                electronic: user.electronic || 0, 
                totalWithdrawn: user.withdrawals.totalAmount || 0
            });
        } else {
            res.status(400).json({ success: false, message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching user data' });
    }
});

app.get('/check-package-status', async (req, res) => {
    const { userId, packageCost } = req.query;

    try {
        // Find the user by userId
        const user = await idgen.findOne({ userId });

        if (user) {
            // Find the package by packageCost
            const packageOpened = user.openPackages.find(pkg => pkg.packageCost === parseInt(packageCost));

            if (!packageOpened) {
                return res.status(404).json({ error: 'Package not found' });
            }

            // Calculate the days passed since the package was last opened
            const daysPassed = Math.floor((Date.now() - new Date(packageOpened.lastOpened).getTime()) / (1000 * 60 * 60 * 24));

            // Calculate the remaining days for the 90-day period
            const daysLeftFor90 = packageOpened.daysLeftFor90 - daysPassed;

            // Return the necessary data in the response
            res.json({
                isTodayRiched: packageOpened.isTodayRiched,
                daysLeftFor90: daysLeftFor90 > 0 ? daysLeftFor90 : 0, // Ensure days don't go negative
            });
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        console.error('Error fetching package status:', error);
        res.status(500).json({ error: 'Server error' });
    }
});


app.get('/api/getCommission', async (req, res) => {
    try {
        const userId = req.query.userId;

        if (!userId) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }

        let user = await idgen.findOne({ userId });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ commission: user.principalAmount });
    } catch (error) {
        console.error('Error occurred:', error.message);
        res.status(500).json({ error: 'Something went wrong' });
    }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(static_path, '404.html'))
});

app.post('/register', async (req, res) => {
    const { username, email, country, phone, password, confirm_password } = req.body;

    if (password !== confirm_password) {
        return res.status(400).send('Passwords do not match');
    }

    function generateUserId() {
        const uuid = uuidv4().replace(/-/g, ''); // Remove dashes from UUID
        return uuid.slice(0, 12); // Extract the first 12 characters
    }

    const userId = generateUserId();

    const user = new idgen({ username, email, country, phone, password, userId });

    try {
        await user.save();
        res.redirect('/login');
    } catch (error) {
        res.status(500).send('Error registering user');
    }
 });
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find the user by email and password in the 'idgen' collection
        const user = await idgen.findOne({ email, password });

        if (user) {
            // Fetch the user's score and electronic value directly from the 'idgen' schema
            const score = user.score || 0;
            const electronic = user.electronic || 0; // Directly get electronic from user

            // Return the user's opened packages along with login data
            const openPackages = user.openPackages || [];

            // Send the response with the necessary user details
            res.json({ 
                success: true, 
                username: user.username, 
                userId: user.userId, 
                score, 
                electronic,  // Now getting directly from 'idgen'
                totalWithdrawn: user.withdrawals.totalAmount, // Return the total withdrawn amount
                openPackages // Return the user's opened packages
            });

        } else {
            res.status(400).json({ success: false, message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error logging in' });
    }
});

cron.schedule('35 0 * * *', async () => {    
try {
        await idgen.updateMany(
            { "openPackages.isTodayRiched": true },
            { 
                $set: { 
                    "openPackages.$[].isTodayRiched": false,
                    "openPackages.$[].dailyIncomeCount": 0
                },
                $inc: { "openPackages.$[].daysLeftFor90": -1 }
            }
        );
        console.log('Reset isTodayRiched and dailyIncomeCount for all users and decremented daysLeftFor90');
    } catch (error) {
        console.error('Error resetting isTodayRiched and dailyIncomeCount:', error);
    }
});
app.post('/save-opened-package', async (req, res) => {
    const { userId, packageCost, referredUserId, updatedElectronic } = req.body;

    try {
        const user = await idgen.findOne({ userId });
        if (user) {
            const packageOpened = user.openPackages.find(pkg => pkg.packageCost === packageCost);

            if (!packageOpened) {
                // Add new package opening record
                user.openPackages.push({ 
                    packageCost, 
                    lastOpened: new Date(), 
                    referredUserId: referredUserId || 'N/A', 
                    isTodayRiched: false,
                    openedDate: new Date() 
                });

                // Update the electronic value
                user.electronic = updatedElectronic; // Save the updated value in the user record

                // Save user record with updated packages and electronic value
                await user.save(); 

                res.json({ success: true, message: 'Package opened and saved successfully, electronic value updated' });
            } else {
                res.status(400).json({ success: false, message: 'Package already opened' });
            }
        } else {
            res.status(404).json({ success: false, message: 'User not found' });
        }
    } catch (error) {
        console.error('Error details:', error); 
        res.status(500).json({ success: false, message: 'Error saving opened package', error: error.message });
    }
});


// app.post('/save-opened-package', async (req, res) => {
//     const { userId, packageCost, referredUserId } = req.body;

//     try {
//         const user = await idgen.findOne({ userId });
//         if (user) {
//             const packageOpened = user.openPackages.find(pkg => pkg.packageCost === packageCost);

//             if (!packageOpened) {
//                 user.openPackages.push({ 
//                     packageCost, 
//                     lastOpened: new Date(), 
//                     referredUserId: referredUserId || 'N/A', 
//                     isTodayRiched: false,
//                     openedDate: new Date() // Set the opened date here
//                 });
//                 await user.save(); 

//                 res.json({ success: true, message: 'Package opened and saved successfully' });
//             } else {
//                 res.status(400).json({ success: false, message: 'Package already opened' });
//             }
//         } else {
//             res.status(404).json({ success: false, message: 'User not found' });
//         }
//     } catch (error) {
//         console.error('Error details:', error); 
//         res.status(500).json({ success: false, message: 'Error saving opened package', error: error.message });
//     }
// });
app.post('/update-today-limit', async (req, res) => {
    const { userId, packageCost, isTodayRiched } = req.body;

    try {
        const user = await idgen.findOne({ userId });
        if (user) {
            const packageToUpdate = user.openPackages.find(pkg => pkg.packageCost === packageCost);
            if (packageToUpdate) {
                packageToUpdate.isTodayRiched = isTodayRiched; // Update the field
                await user.save(); // Save changes to the database

                res.json({ success: true, message: 'Daily limit updated successfully' });
            } else {
                res.status(404).json({ success: false, message: 'Package not found' });
            }
        } else {
            res.status(404).json({ success: false, message: 'User not found' });
        }
    } catch (error) {
        console.error('Error updating today limit:', error);
        res.status(500).json({ success: false, message: 'Error updating today limit', error: error.message });
    }
});

app.post('/check-user-exists', async (req, res) => {
    const { referredUserId } = req.body;

    try {
        // Search for the referred user in the database
        const user = await idgen.findOne({ userId: referredUserId });

        if (user) {
            res.json({ exists: true });
        } else {
            res.json({ exists: false });
        }
    } catch (error) {
        console.error('Error checking user existence:', error);
        res.status(500).json({ success: false, message: 'Error checking user existence', error: error.message });
    }
});



app.post('/deposit-request', async (req, res) => {
    const { package, userId, details } = req.body;

    try {
        let depositRequest = await idgen.findOne({ userId });

        if (depositRequest) {
            // Initialize the deposit array if it doesn't exist
            if (!depositRequest.deposit) {
                depositRequest.deposit = [];
            }

            // Push new deposit entry into the deposit array
            depositRequest.deposit.push({
                package,
                details,
                electronic: depositRequest.electronic + 0, // Example increment; adjust as needed
                requestTime: Date.now()
            });

            await depositRequest.save();
            res.json({ message: 'Deposit request updated successfully', deposit: depositRequest.deposit });
        } else {
            // Create a new deposit request
            depositRequest = new idgen({
                userId,
                deposit: [
                    {
                        package,
                        details,
                        electronic: 200, // Initialize electronic
                        requestTime: Date.now()
                    }
                ]
            });
            await depositRequest.save();
            res.json({ message: 'Deposit request submitted successfully', deposit: depositRequest.deposit });
        }
    } catch (error) {
        console.error(error); // Log the actual error for debugging
        res.status(500).json({ error: 'deposit request error.' });
    }
});


// check-deposit endpoint
app.post('/check-deposit', async (req, res) => {
    const { userId } = req.body;

    try {
        const depositRequest = await idgen.findOne({ userId });

        if (depositRequest) {
            // Return the electronic value, score, and the full deposit array
            res.json({
                electronic: depositRequest.electronic,
                score: depositRequest.score,
                deposits: depositRequest.deposit // Return all deposits made by the user
            });
        } else {
            res.json({ electronic: 0, score: 0, deposits: [] }); // Return default values if no deposit request is found
        }
    } catch (error) {
        res.status(500).json({ error: 'error chake deposit.' });
    }
});
// API to store Binance info
app.post('/api/store-binance', async (req, res) => {
    try {
        const { userId, binanceInfo } = req.body;

        if (!userId || !binanceInfo) {
            return res.status(400).json({ success: false, message: 'User ID and Binance info are required' });
        }

        // Find the user in the database by userId
        const user = await idgen.findOne({ userId: userId });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Update the user document with the Binance info
        user.Binance = binanceInfo;
        await user.save();

        // Return success response
        return res.json({ success: true, message: 'Binance info saved successfully' });
    } catch (error) {
        console.error('Error saving Binance info:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
});
app.post('/api/verify-password', async(req, res) => {
    const { username, password } = req.body;
    try {
        const user = await idgen.findOne({ username });
        if (user && user.password === password) { // Compare plain text passwords
            res.json({ success: true });
        } else {
            res.json({ success: false });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal server error');
    }
});

    // Updated getDailyLimit function
function getDailyLimit(cost) {
    switch (cost) {
        case 9000: return 300;
        case 18000: return 300;
        case 30000: return 200;
        case 60000: return 200;
        case 120000: return 400;
        default: return 300;
    }
}
app.post('/income', async (req, res) => {
    try {
        const { userId, packageCost, income } = req.body;

        // Validate input data
        if (!userId || isNaN(packageCost) || isNaN(income)) {
            return res.status(400).json({ error: 'Invalid input data' });
        }

        // Find the user by userId
        let user = await idgen.findOne({ userId });

        // If user not found
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Find the opened package with the specified packageCost
        const packageOpened = user.openPackages.find(pkg => pkg.packageCost === parseInt(packageCost));

        // If the package doesn't exist or has expired
        if (!packageOpened || packageOpened.daysLeftFor90 <= 0) {
            return res.status(400).json({ error: 'Package expired or not found' });
        }

        // Get the daily limit for the specific package
        const dailyLimit = getDailyLimit(packageCost);

        // Check if the package has reached the daily limit
        if (packageOpened.isTodayRiched || packageOpened.dailyIncomeCount >= dailyLimit) {
            return res.status(400).json({ error: 'Daily limit reached' });
        }

        // Update the user's score with the score sent from the frontend (local score)
        user.score = income;  // Directly set the score to the local score shown on frontend

        // Increment the daily income count
        packageOpened.dailyIncomeCount = (packageOpened.dailyIncomeCount || 0) + 1;

        // Mark the package as having reached the daily limit if count exceeds or matches the limit
        if (packageOpened.dailyIncomeCount >= dailyLimit) {
            packageOpened.isTodayRiched = true;
        }

        // Save updated user data
        await user.save();

        // Respond with success and updated score
        res.json({ success: true, score: user.score });

    } catch (error) {
        console.error('Error occurred:', error.message);
        res.status(500).json({ error: 'Something went wrong' });
    }
});


app.post('/api/setReferral', async (req, res) => {
    try {
        const { userId, referredUserId } = req.body;

        if (!userId || !referredUserId) {
            return res.status(400).json({ error: 'Invalid input data' });
        }

        let user = await idgen.findOne({ userId });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        user.referredUserId = referredUserId;
        await user.save();

        res.json({ success: true });
    } catch (error) {
        console.error('Error occurred:', error.message);
        res.status(500).json({ error: 'Something went wrong' });
    }
});
app.post('/api/withdraw', async (req, res) => {
    try {
        const { userId, amount } = req.body;

        // Input validation
        if (!userId || isNaN(amount) || amount <= 0) {
            return res.status(400).json({ error: 'Invalid input data' });
        }

        // Find the user
        let user = await idgen.findOne({ userId });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check if the user has sufficient funds
        if (user.score < amount) {
            return res.status(400).json({ error: 'Insufficient funds' });
        }

        // Deduct the amount from user's score
        user.score -= amount;

        // Update total withdrawals and last withdrawal date
        user.withdrawals.totalAmount += amount;
        user.withdrawals.lastWithdrawalDate = new Date();

        // Add new entry to withdrawal history
        user.withdrawals.history.push({
            amount: amount,
            date: new Date() // Current date and time
        });

        // Save the user record with updated information
        await user.save();

        res.json({ message: 'Withdrawal successful', score: user.score });
    } catch (error) {
        console.error('Error occurred:', error.message);
        res.status(500).json({ error: 'Something went wrong' });
    }
});



app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
