/**
 * Created by deep on 4/13/17.
 */

/**
 * uses regular expressions to check if the email is a valid email address
 *
 * @return true if it's a valid email
 * */
exports.validEmail = function (email) {
    let re = /^([\w_\.\-\+])+\@([\w\-]+\.)+([\w]{2,10})+$/;
    return email.match(re);
};

/**
 * uses regular expressions to check if the phone is a valid phone number with at least 10 digits
 *
 * ex. can be in the following formats
 *      1) 1234567890
 *      2) 123.456.7890 separated by .
 *      3) 123-456-7890 separated by -
 *      4) 123 456 7890 seperated by spaces
 *
 * @return true if it's a valid phone number
 * */
exports.validPhone = function (phone) {
    let re = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
    return phone.match(re);
};

/**
 * uses regular expressions to check if the username matches criteria
 *
 * criteria -
 *      - may contain characters must be a-z
 *      - may contain 0-9
 *      - may contain underscore and hyphen
 *      - at least 5 chars no more than 30
 *
 * Regex
 *      - ^             # Start of the line
 *      - [a-z0-9_-]    # Match characters and symbols in the list, a-z, 0-9, underscore, hyphen
 *      - {5,30}        # Length at least 5 characters and maximum length of 30
 *      - $             # End of the line
 *
 * @return true if it's a valid username and matches regex
 * */
exports.validUsername = function (username) {
    let re = /^[a-z0-9_\-]{5,30}$/;
    return username.match(re);
};

/**
 * uses regular expressions to check if the password is valid
 *
 * criteria -
 *      - must contain 8 characters
 *      - have at least one number
 *      - have one letter
 *      - have one unique character such as !#$%&? "
 *
 *      ^.*(?=.{8,})(?=.*[a-zA-Z])(?=.*\d)(?=.*[!#$%&? "]).*$
 *
 *      ---
 *
 *      ^.*              : Start
 *      (?=.{8,})        : Length
 *      (?=.*[a-zA-Z])   : Letters
 *      (?=.*\d)         : Digits
 *      (?=.*[!#$%&? "]) : Special characters
 *      .*$              : End
 *
 * @return true if it's a valid password
 * */
exports.validPassword = function (password) {
    let re = /^.*(?=.{8,})(?=.*[a-zA-Z])(?=.*\d)(?=.*[!#$%&? "]).*$/;
    return password.match(re);
};

