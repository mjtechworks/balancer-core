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

contract BBronze {
    function getColor()
        public view returns (bytes32);
    function isBound(address token)
        public view returns (bool);
    function getNumTokens()
        public view returns (uint);
    function getWeight(address token)
        public view returns (uint);
    function getBalance(address token)
        public view returns (uint);
    function getValue()
        public view returns (uint res);
    function getWeightedValue()
        public view returns (uint Wt);

    function start()
        public;
    function pause()
        public;
    function bind(address token, uint balance, uint weight)
        public;
    function unbind(address token)
        public;
    function setParams(address token, uint weight, uint balance)
        public;
    function setManager(address manager)
        public;
    function setFee(uint fee)
        public;
    function sweep(address token)
        public;

    function viewSwap_ExactInAnyOut(address Ti, uint Ai, address To)
        public view returns (uint Ao, byte err);
    function trySwap_ExactInAnyOut(address Ti, uint Ai, address To)
        public returns (uint Ao, byte err);
    function doSwap_ExactInAnyOut(address Ti, uint Ai, address To)
        public returns (uint Ao);

    function viewSwap_ExactOutAnyIn(address Ti, address To, uint Ao)
        public view returns (uint Ai, byte err);
    function trySwap_ExactOutAnyIn(address Ti, address To, uint Ao)
        public returns (uint Ai, byte err);
    function doSwap_ExactOutAnyIn(address Ti, address To, uint Ao)
        public returns (uint Ai);

}
