#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short, token, Address, Env, Map, String, Symbol,
    Vec,
};

// Contract data keys
const ADMIN: Symbol = symbol_short!("ADMIN");
const USERS: Symbol = symbol_short!("USERS");
const PAYMENTS: Symbol = symbol_short!("PAYMENTS");
const TIP_LINKS: Symbol = symbol_short!("TIP_LINKS");
const BALANCES: Symbol = symbol_short!("BALANCES");

#[derive(Clone)]
#[contracttype]
pub struct User {
    pub username: String,
    pub stellar_address: Address,
    pub passkey_id: String,
    pub created_at: u64,
    pub total_sent: i128,
    pub total_received: i128,
}

#[derive(Clone)]
#[contracttype]
pub struct Payment {
    pub id: u64,
    pub from: Address,
    pub to: Address,
    pub amount: i128,
    pub token: Address,
    pub memo: String,
    pub timestamp: u64,
    pub payment_type: PaymentType,
}

#[derive(Clone)]
#[contracttype]
pub enum PaymentType {
    Transfer,
    Tip,
    Reward,
    Gift,
}

#[derive(Clone)]
#[contracttype]
pub struct TipLink {
    pub username: String,
    pub owner: Address,
    pub total_tips: i128,
    pub tip_count: u64,
    pub active: bool,
}

#[contract]
pub struct StellarPassContract;

#[contractimpl]
impl StellarPassContract {
    /// Initialize the contract with an admin
    pub fn initialize(env: Env, admin: Address) {
        admin.require_auth();
        env.storage().instance().set(&ADMIN, &admin);
    }

    /// Register a new user with passkey authentication
    pub fn register_user(
        env: Env,
        username: String,
        stellar_address: Address,
        passkey_id: String,
    ) -> Result<(), Symbol> {
        stellar_address.require_auth();

        // Check if username already exists
        let users: Map<String, User> = env
            .storage()
            .persistent()
            .get(&USERS)
            .unwrap_or(Map::new(&env));

        if users.contains_key(username.clone()) {
            return Err(symbol_short!("EXISTS"));
        }

        // Create new user
        let user = User {
            username: username.clone(),
            stellar_address: stellar_address.clone(),
            passkey_id,
            created_at: env.ledger().timestamp(),
            total_sent: 0,
            total_received: 0,
        };

        // Store user
        let mut updated_users = users;
        updated_users.set(username.clone(), user);
        env.storage().persistent().set(&USERS, &updated_users);

        // Create tip link for user
        let tip_link = TipLink {
            username: username.clone(),
            owner: stellar_address,
            total_tips: 0,
            tip_count: 0,
            active: true,
        };

        let mut tip_links: Map<String, TipLink> = env
            .storage()
            .persistent()
            .get(&TIP_LINKS)
            .unwrap_or(Map::new(&env));
        tip_links.set(username, tip_link);
        env.storage().persistent().set(&TIP_LINKS, &tip_links);

        Ok(())
    }

    /// Send a micro-payment between users
    pub fn send_payment(
        env: Env,
        from: Address,
        to: Address,
        amount: i128,
        token: Address,
        memo: String,
        payment_type: PaymentType,
    ) -> Result<u64, Symbol> {
        from.require_auth();

        if amount <= 0 {
            return Err(symbol_short!("INVALID"));
        }

        // Transfer tokens
        let token_client = token::Client::new(&env, &token);
        token_client.transfer(&from, &to, &amount);

        // Create payment record
        let payment_id = Self::get_next_payment_id(&env);
        let payment = Payment {
            id: payment_id,
            from: from.clone(),
            to: to.clone(),
            amount,
            token,
            memo,
            timestamp: env.ledger().timestamp(),
            payment_type,
        };

        // Store payment
        let mut payments: Vec<Payment> = env
            .storage()
            .persistent()
            .get(&PAYMENTS)
            .unwrap_or(Vec::new(&env));
        payments.push_back(payment);
        env.storage().persistent().set(&PAYMENTS, &payments);

        // Update user statistics
        Self::update_user_stats(&env, &from, &to, amount);

        Ok(payment_id)
    }

    /// Send a tip using tip link
    pub fn send_tip(
        env: Env,
        from: Address,
        username: String,
        amount: i128,
        token: Address,
        message: String,
    ) -> Result<u64, Symbol> {
        from.require_auth();

        // Get tip link
        let tip_links: Map<String, TipLink> = env
            .storage()
            .persistent()
            .get(&TIP_LINKS)
            .unwrap_or(Map::new(&env));

        let mut tip_link = tip_links
            .get(username.clone())
            .ok_or(symbol_short!("NOTFOUND"))?;

        if !tip_link.active {
            return Err(symbol_short!("INACTIVE"));
        }

        // Send payment to tip link owner
        let payment_id = Self::send_payment(
            env.clone(),
            from,
            tip_link.owner.clone(),
            amount,
            token,
            message,
            PaymentType::Tip,
        )?;

        // Update tip link statistics
        tip_link.total_tips += amount;
        tip_link.tip_count += 1;

        let mut updated_tip_links = tip_links;
        updated_tip_links.set(username, tip_link);
        env.storage().persistent().set(&TIP_LINKS, &updated_tip_links);

        Ok(payment_id)
    }

    /// Get user information
    pub fn get_user(env: Env, username: String) -> Option<User> {
        let users: Map<String, User> = env
            .storage()
            .persistent()
            .get(&USERS)
            .unwrap_or(Map::new(&env));
        users.get(username)
    }

    /// Get tip link information
    pub fn get_tip_link(env: Env, username: String) -> Option<TipLink> {
        let tip_links: Map<String, TipLink> = env
            .storage()
            .persistent()
            .get(&TIP_LINKS)
            .unwrap_or(Map::new(&env));
        tip_links.get(username)
    }

    /// Get recent payments for a user
    pub fn get_user_payments(env: Env, user_address: Address, limit: u32) -> Vec<Payment> {
        let payments: Vec<Payment> = env
            .storage()
            .persistent()
            .get(&PAYMENTS)
            .unwrap_or(Vec::new(&env));

        let mut user_payments = Vec::new(&env);
        let mut count = 0u32;

        // Get most recent payments involving the user
        for i in (0..payments.len()).rev() {
            if count >= limit {
                break;
            }
            
            if let Some(payment) = payments.get(i) {
                if payment.from == user_address || payment.to == user_address {
                    user_payments.push_back(payment);
                    count += 1;
                }
            }
        }

        user_payments
    }

    /// Get contract statistics
    pub fn get_stats(env: Env) -> (u32, u32, i128) {
        let users: Map<String, User> = env
            .storage()
            .persistent()
            .get(&USERS)
            .unwrap_or(Map::new(&env));

        let payments: Vec<Payment> = env
            .storage()
            .persistent()
            .get(&PAYMENTS)
            .unwrap_or(Vec::new(&env));

        let mut total_volume = 0i128;
        for i in 0..payments.len() {
            if let Some(payment) = payments.get(i) {
                total_volume += payment.amount;
            }
        }

        (users.len(), payments.len(), total_volume)
    }

    /// Toggle tip link active status
    pub fn toggle_tip_link(env: Env, username: String, owner: Address) -> Result<bool, Symbol> {
        owner.require_auth();

        let tip_links: Map<String, TipLink> = env
            .storage()
            .persistent()
            .get(&TIP_LINKS)
            .unwrap_or(Map::new(&env));

        let mut tip_link = tip_links
            .get(username.clone())
            .ok_or(symbol_short!("NOTFOUND"))?;

        if tip_link.owner != owner {
            return Err(symbol_short!("UNAUTHORIZED"));
        }

        tip_link.active = !tip_link.active;
        let new_status = tip_link.active;

        let mut updated_tip_links = tip_links;
        updated_tip_links.set(username, tip_link);
        env.storage().persistent().set(&TIP_LINKS, &updated_tip_links);

        Ok(new_status)
    }

    // Helper functions
    fn get_next_payment_id(env: &Env) -> u64 {
        let payments: Vec<Payment> = env
            .storage()
            .persistent()
            .get(&PAYMENTS)
            .unwrap_or(Vec::new(env));
        payments.len() as u64
    }

    fn update_user_stats(env: &Env, from: &Address, to: &Address, amount: i128) {
        let users: Map<String, User> = env
            .storage()
            .persistent()
            .get(&USERS)
            .unwrap_or(Map::new(env));

        let mut updated_users = users;

        // Update sender stats
        for i in 0..updated_users.len() {
            if let Some((username, mut user)) = updated_users.get_by_index(i) {
                if user.stellar_address == *from {
                    user.total_sent += amount;
                    updated_users.set(username, user);
                    break;
                }
            }
        }

        // Update receiver stats
        for i in 0..updated_users.len() {
            if let Some((username, mut user)) = updated_users.get_by_index(i) {
                if user.stellar_address == *to {
                    user.total_received += amount;
                    updated_users.set(username, user);
                    break;
                }
            }
        }

        env.storage().persistent().set(&USERS, &updated_users);
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Address, Env};

    #[test]
    fn test_register_user() {
        let env = Env::default();
        let contract_id = env.register_contract(None, StellarPassContract);
        let client = StellarPassContractClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let user_addr = Address::generate(&env);

        // Initialize contract
        client.initialize(&admin);

        // Register user
        let result = client.register_user(
            &"testuser".into(),
            &user_addr,
            &"passkey123".into(),
        );
        assert!(result.is_ok());

        // Check user exists
        let user = client.get_user(&"testuser".into());
        assert!(user.is_some());
        assert_eq!(user.unwrap().username, "testuser");
    }

    #[test]
    fn test_tip_link() {
        let env = Env::default();
        let contract_id = env.register_contract(None, StellarPassContract);
        let client = StellarPassContractClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let user_addr = Address::generate(&env);

        // Initialize and register user
        client.initialize(&admin);
        client.register_user(
            &"creator".into(),
            &user_addr,
            &"passkey123".into(),
        ).unwrap();

        // Check tip link was created
        let tip_link = client.get_tip_link(&"creator".into());
        assert!(tip_link.is_some());
        assert_eq!(tip_link.unwrap().owner, user_addr);
    }
} 