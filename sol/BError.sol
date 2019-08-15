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

pragma solidity ^0.5.10;

import "ds-math/math.sol";

// `pure internal` operating on constants should get fully optimized by compiler

contract BError {
    byte constant ERR_NONE      = 0x00;
    byte constant ERR_PAUSED    = 0x01;
    byte constant ERR_NOT_BOUND = 0x02;
    
    function serr(byte berr)
        pure internal
        returns (string memory)
    {
        if( berr == ERR_NONE )
            return "ERR_NONE";
        if( berr == ERR_PAUSED )
            return "ERR_PAUSED";
        if( berr == ERR_NOT_BOUND )
            return "ERR_NOT_BOUND";

        return "err-meta--unkown-berr";
    }
  
    function check(byte berr)
        pure internal
    {
        check(berr == ERR_NONE, berr);
    } 
    function check(bool cond, byte berr)
        pure internal
    {
        if(!cond)
            chuck(berr);
    }

    // like throw haha 
    function chuck(byte berr)
        pure internal
    {
        revert(serr(berr));
    }
}
