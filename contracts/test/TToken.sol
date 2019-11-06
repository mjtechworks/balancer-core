// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

pragma solidity ^0.5.11;

import "../BToken.sol";

// TToken is a test token with public `mint` and `burn`.

contract TToken is BToken {
    function mint(uint amt) external {
        _mint(amt);
        _push(msg.sender, amt);
    }
    function burn(uint amt) external {
        _pull(msg.sender, amt);
        _burn(amt);
    }
}
