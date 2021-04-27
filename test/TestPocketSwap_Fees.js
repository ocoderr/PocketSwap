const ERC20 = artifacts.require("mocks/MockERC20.sol")
const PocketSwapFactory = artifacts.require("pocketswap/PocketSwapFactory.sol")
const PocketSwapRouter = artifacts.require("pocketswap/PocketSwapRouter.sol")
const PocketSwapPair = artifacts.require("pocketswap/PocketSwapPair.sol")

const pocketSwapHelper = require('../helpers/Helper')

contract("PocketSwap Fees", accounts => {
    let token_1
    let token_2
    let WETH
    let factory
    let router
    let pair

    const deadline = () => {
        return parseInt(Date.now() / 1000) + 15 * 60
    }
    //
    // Factory address:  0x6Be8eDd2Ed105471fC6A86c72296C98A63019229
    // Token1 address:  0x789E5d218BEd461b2bA7561E425Ec64b3F36A7D9
    // Token2 address:  0xccfde734629d5235a424c8488F587Ba7421175BD
    // Router address:  0xA237f094B4CD18E2E1f3E0D5ad02337450FeBad9
    // Pair address:  0x6Be8eDd2Ed105471fC6A86c72296C98A63019229
    //
    // LP Balance: 3162277660168379330998
    //
    //
    before(async () => {
        // console.log(`Pair init code: ${await web3.utils.keccak256("0x60806040526001600c5534801561001557600080fd5b50604080518082018252600a8152690506f636b6574537761760b41b6020918201528151808301835260018152603160f81b9082015281517f8b73c3c69bb8fe3d512ecc4cf759cc79239f7b179b0ffacaa9a75d522b39400f818301527f139f1c71b7c3168b7aeac519a0d6ee819b7e7428c66952642d99299cb2a31352818401527fc89efdaa54c0f20c7adf612882df0950f5a951637e0307cdcb4c672f298b8bc660608201524660808201523060a0808301919091528351808303909101815260c09091019092528151910120600355600580546001600160a01b031916331790556121fa806101086000396000f3fe608060405234801561001057600080fd5b50600436106101a95760003560e01c80636a627842116100f9578063ba9a7a5611610097578063d21220a711610071578063d21220a714610534578063d505accf1461053c578063dd62ed3e1461058d578063fff6cae9146105bb576101a9565b8063ba9a7a56146104fe578063bc25cf7714610506578063c45a01551461052c576101a9565b80637ecebe00116100d35780637ecebe001461046557806389afcb441461048b57806395d89b41146104ca578063a9059cbb146104d2576101a9565b80636a6278421461041157806370a08231146104375780637464fc3d1461045d576101a9565b806323b872dd116101665780633644e515116101405780633644e515146103cb578063485cc955146103d35780635909c0d5146104015780635a3d549314610409576101a9565b806323b872dd1461036f57806330adf81f146103a5578063313ce567146103ad576101a9565b8063022c0d9f146101ae57806306fdde031461023c5780630902f1ac146102b9578063095ea7b3146102f15780630dfe16811461033157806318160ddd14610355575b600080fd5b61023a600480360360808110156101c457600080fd5b8135916020810135916001600160a01b0360408301351691908101906080810160608201356401000000008111156101fb57600080fd5b82018360208201111561020d57600080fd5b8035906020019184600183028401116401000000008311171561022f57600080fd5b5090925090506105c3565b005b610244610ace565b6040805160208082528351818301528351919283929083019185019080838360005b8381101561027e578181015183820152602001610266565b50505050905090810190601f1680156102ab5780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b6102c1610af4565b604080516001600160701b03948516815292909316602083015263ffffffff168183015290519081900360600190f35b61031d6004803603604081101561030757600080fd5b506001600160a01b038135169060200135610b1e565b604080519115158252519081900360200190f35b610339610b35565b604080516001600160a01b039092168252519081900360200190f35b61035d610b44565b60408051918252519081900360200190f35b61031d6004803603606081101561038557600080fd5b506001600160a01b03813581169160208101359091169060400135610b4a565b61035d610bde565b6103b5610c02565b6040805160ff9092168252519081900360200190f35b61035d610c07565b61023a600480360360408110156103e957600080fd5b506001600160a01b0381358116916020013516610c0d565b61035d610c92565b61035d610c98565b61035d6004803603602081101561042757600080fd5b50356001600160a01b0316610c9e565b61035d6004803603602081101561044d57600080fd5b50356001600160a01b0316610f93565b61035d610fa5565b61035d6004803603602081101561047b57600080fd5b50356001600160a01b0316610fab565b6104b1600480360360208110156104a157600080fd5b50356001600160a01b0316610fbd565b6040805192835260208301919091528051918290030190f35b610244611352565b61031d600480360360408110156104e857600080fd5b506001600160a01b038135169060200135611375565b61035d611382565b61023a6004803603602081101561051c57600080fd5b50356001600160a01b0316611388565b6103396114fb565b61033961150a565b61023a600480360360e081101561055257600080fd5b506001600160a01b03813581169160208101359091169060408101359060608101359060ff6080820135169060a08101359060c00135611519565b61035d600480360360408110156105a357600080fd5b506001600160a01b038135811691602001351661171c565b61023a611739565b600c5460011461060f576040805162461bcd60e51b8152602060048201526012602482015271141bd8dad95d14ddd85c0e881313d0d2d15160721b604482015290519081900360640190fd5b6000600c55841515806106225750600084115b61065d5760405162461bcd60e51b81526004018080602001828103825260268152602001806121766026913960400191505060405180910390fd5b600080610668610af4565b5091509150816001600160701b03168710801561068d5750806001600160701b031686105b6106c85760405162461bcd60e51b81526004018080602001828103825260228152602001806121546022913960400191505060405180910390fd5b60065460075460009182916001600160a01b039182169190811690891682148015906107065750806001600160a01b0316896001600160a01b031614155b610750576040805162461bcd60e51b8152602060048201526016602482015275506f636b6574537761703a20494e56414c49445f544f60501b604482015290519081900360640190fd5b8a1561076157610761828a8d61189c565b891561077257610772818a8c61189c565b861561082457886001600160a01b03166310d1e85c338d8d8c8c6040518663ffffffff1660e01b815260040180866001600160a01b03168152602001858152602001848152602001806020018281038252848482818152602001925080828437600081840152601f19601f8201169050808301925050509650505050505050600060405180830381600087803b15801561080b57600080fd5b505af115801561081f573d6000803e3d6000fd5b505050505b604080516370a0823160e01b815230600482015290516001600160a01b038416916370a08231916024808301926020929190829003018186803b15801561086a57600080fd5b505afa15801561087e573d6000803e3d6000fd5b505050506040513d602081101561089457600080fd5b5051604080516370a0823160e01b815230600482015290519195506001600160a01b038316916370a0823191602480820192602092909190829003018186803b1580156108e057600080fd5b505afa1580156108f4573d6000803e3d6000fd5b505050506040513d602081101561090a57600080fd5b5051925060009150506001600160701b0385168a9003831161092d57600061093c565b89856001600160701b03160383035b9050600089856001600160701b0316038311610959576000610968565b89856001600160701b03160383035b905060008211806109795750600081115b6109b45760405162461bcd60e51b81526004018080602001828103825260258152602001806121066025913960400191505060405180910390fd5b60006109d66109c4846003611a36565b6109d0876103e8611a36565b90611a99565b905060006109e86109c4846003611a36565b9050610a0d620f4240610a076001600160701b038b8116908b16611a36565b90611a36565b610a178383611a36565b1015610a5a576040805162461bcd60e51b815260206004820152600d60248201526c506f636b6574537761703a204b60981b604482015290519081900360640190fd5b5050610a6884848888611ae9565b60408051838152602081018390528082018d9052606081018c905290516001600160a01b038b169133917fd78ad95fa46c994b6551d0da85fc275fe613ce37657fb8d5e3d130840159d8229181900360800190a350506001600c55505050505050505050565b6040518060400160405280600a8152602001690506f636b6574537761760b41b81525081565b6008546001600160701b0380821692600160701b830490911691600160e01b900463ffffffff1690565b6000610b2b338484611ca9565b5060015b92915050565b6006546001600160a01b031681565b60005481565b6001600160a01b038316600090815260026020908152604080832033845290915281205460001914610bc9576001600160a01b0384166000908152600260209081526040808320338452909152902054610ba49083611a99565b6001600160a01b03851660009081526002602090815260408083203384529091529020555b610bd4848484611d0b565b5060019392505050565b7f6e71edae12b1b97f4d1f60370fef10105fa2faae0126114a169c64845d6126c981565b601281565b60035481565b6005546001600160a01b03163314610c64576040805162461bcd60e51b81526020600482015260156024820152742837b1b5b2ba29bbb0b81d102327a92124a22222a760591b604482015290519081900360640190fd5b600680546001600160a01b039384166001600160a01b03199182161790915560078054929093169116179055565b60095481565b600a5481565b6000600c54600114610cec576040805162461bcd60e51b8152602060048201526012602482015271141bd8dad95d14ddd85c0e881313d0d2d15160721b604482015290519081900360640190fd5b6000600c81905580610cfc610af4565b50600654604080516370a0823160e01b815230600482015290519395509193506000926001600160a01b03909116916370a08231916024808301926020929190829003018186803b158015610d5057600080fd5b505afa158015610d64573d6000803e3d6000fd5b505050506040513d6020811015610d7a57600080fd5b5051600754604080516370a0823160e01b815230600482015290519293506000926001600160a01b03909216916370a0823191602480820192602092909190829003018186803b158015610dcd57600080fd5b505afa158015610de1573d6000803e3d6000fd5b505050506040513d6020811015610df757600080fd5b505190506000610e10836001600160701b038716611a99565b90506000610e27836001600160701b038716611a99565b90506000610e358787611db9565b60005490915080610e85576040805162461bcd60e51b815260206004820152601060248201526f6265666f7265206c697175696469747960801b604482015290519081900360640190fd5b611ef9565b610ec56001600160701b038916610e9c8684611a36565b81610ea357fe5b046001600160701b038916610eb88685611a36565b81610ebf57fe5b04611fd5565b985060008911610f065760405162461bcd60e51b815260040180806020018281038252602981526020018061212b6029913960400191505060405180910390fd5b610f108a8a611f4b565b610f1c86868a8a611ae9565b8115610f4657600854610f42906001600160701b0380821691600160701b900416611a36565b600b555b6040805185815260208101859052815133927f4c209b5fc8ad50758f13e2e1088ba56a560dff690a1c6fef26394f4c03821c4f928290030190a250506001600c5550949695505050505050565b60016020526000908152604090205481565b600b5481565b60046020526000908152604090205481565b600080600c5460011461100c576040805162461bcd60e51b8152602060048201526012602482015271141bd8dad95d14ddd85c0e881313d0d2d15160721b604482015290519081900360640190fd5b6000600c8190558061101c610af4565b50600654600754604080516370a0823160e01b815230600482015290519496509294506001600160a01b039182169391169160009184916370a08231916024808301926020929190829003018186803b15801561107857600080fd5b505afa15801561108c573d6000803e3d6000fd5b505050506040513d60208110156110a257600080fd5b5051604080516370a0823160e01b815230600482015290519192506000916001600160a01b038516916370a08231916024808301926020929190829003018186803b1580156110f057600080fd5b505afa158015611104573d6000803e3d6000fd5b505050506040513d602081101561111a57600080fd5b5051306000908152600160205260408120549192506111398888611db9565b6000549091508061114a8487611a36565b8161115157fe5b049a508061115f8486611a36565b8161116657fe5b04995060008b118015611179575060008a115b6111b45760405162461bcd60e51b815260040180806020018281038252602981526020018061219c6029913960400191505060405180910390fd5b6111be3084611fed565b6111c9878d8d61189c565b6111d4868d8c61189c565b604080516370a0823160e01b815230600482015290516001600160a01b038916916370a08231916024808301926020929190829003018186803b15801561121a57600080fd5b505afa15801561122e573d6000803e3d6000fd5b505050506040513d602081101561124457600080fd5b5051604080516370a0823160e01b815230600482015290519196506001600160a01b038816916370a0823191602480820192602092909190829003018186803b15801561129057600080fd5b505afa1580156112a4573d6000803e3d6000fd5b505050506040513d60208110156112ba57600080fd5b505193506112ca85858b8b611ae9565b81156112f4576008546112f0906001600160701b0380821691600160701b900416611a36565b600b555b604080518c8152602081018c905281516001600160a01b038f169233927fdccd412f0b1252819cb1fd330b93224ca42612892bb3f4f789976e6d81936496929081900390910190a35050505050505050506001600c81905550915091565b60405180604001604052806007815260200166282996a820a4a960c91b81525081565b6000610b2b338484611d0b565b6103e881565b600c546001146113d4576040805162461bcd60e51b8152602060048201526012602482015271141bd8dad95d14ddd85c0e881313d0d2d15160721b604482015290519081900360640190fd5b6000600c55600654600754600854604080516370a0823160e01b815230600482015290516001600160a01b03948516949093169261147d9285928792611478926001600160701b03169185916370a0823191602480820192602092909190829003018186803b15801561144657600080fd5b505afa15801561145a573d6000803e3d6000fd5b505050506040513d602081101561147057600080fd5b505190611a99565b61189c565b6114f181846114786008600e9054906101000a90046001600160701b03166001600160701b0316856001600160a01b03166370a08231306040518263ffffffff1660e01b815260040180826001600160a01b0316815260200191505060206040518083038186803b15801561144657600080fd5b50506001600c5550565b6005546001600160a01b031681565b6007546001600160a01b031681565b42841015611564576040805162461bcd60e51b8152602060048201526013602482015272141bd8dad95d14ddd85c0e8811561412549151606a1b604482015290519081900360640190fd5b6003546001600160a01b0380891660008181526004602090815260408083208054600180820190925582517f6e71edae12b1b97f4d1f60370fef10105fa2faae0126114a169c64845d6126c98186015280840196909652958d166060860152608085018c905260a085019590955260c08085018b90528151808603909101815260e08501825280519083012061190160f01b6101008601526101028501969096526101228085019690965280518085039096018652610142840180825286519683019690962095839052610162840180825286905260ff89166101828501526101a284018890526101c28401879052519193926101e280820193601f1981019281900390910190855afa15801561167f573d6000803e3d6000fd5b5050604051601f1901519150506001600160a01b038116158015906116b55750886001600160a01b0316816001600160a01b0316145b611706576040805162461bcd60e51b815260206004820152601d60248201527f506f636b6574537761703a20494e56414c49445f5349474e4154555245000000604482015290519081900360640190fd5b611711898989611ca9565b505050505050505050565b600260209081526000928352604080842090915290825290205481565b600c54600114611785576040805162461bcd60e51b8152602060048201526012602482015271141bd8dad95d14ddd85c0e881313d0d2d15160721b604482015290519081900360640190fd5b6000600c55600654604080516370a0823160e01b81523060048201529051611895926001600160a01b0316916370a08231916024808301926020929190829003018186803b1580156117d657600080fd5b505afa1580156117ea573d6000803e3d6000fd5b505050506040513d602081101561180057600080fd5b5051600754604080516370a0823160e01b815230600482015290516001600160a01b03909216916370a0823191602480820192602092909190829003018186803b15801561184d57600080fd5b505afa158015611861573d6000803e3d6000fd5b505050506040513d602081101561187757600080fd5b50516008546001600160701b0380821691600160701b900416611ae9565b6001600c55565b604080518082018252601981527f7472616e7366657228616464726573732c75696e74323536290000000000000060209182015281516001600160a01b0385811660248301526044808301869052845180840390910181526064909201845291810180516001600160e01b031663a9059cbb60e01b1781529251815160009460609489169392918291908083835b602083106119495780518252601f19909201916020918201910161192a565b6001836020036101000a0380198251168184511680821785525050505050509050019150506000604051808303816000865af19150503d80600081146119ab576040519150601f19603f3d011682016040523d82523d6000602084013e6119b0565b606091505b50915091508180156119de5750805115806119de57508080602001905160208110156119db57600080fd5b50515b611a2f576040805162461bcd60e51b815260206004820152601b60248201527f506f636b6574537761703a205452414e534645525f4641494c45440000000000604482015290519081900360640190fd5b5050505050565b6000811580611a5157505080820282828281611a4e57fe5b04145b610b2f576040805162461bcd60e51b815260206004820152601460248201527364732d6d6174682d6d756c2d6f766572666c6f7760601b604482015290519081900360640190fd5b80820382811115610b2f576040805162461bcd60e51b815260206004820152601560248201527464732d6d6174682d7375622d756e646572666c6f7760581b604482015290519081900360640190fd5b6001600160701b038411801590611b0757506001600160701b038311155b611b4f576040805162461bcd60e51b8152602060048201526014602482015273506f636b6574537761703a204f564552464c4f5760601b604482015290519081900360640190fd5b60085463ffffffff42811691600160e01b90048116820390811615801590611b7f57506001600160701b03841615155b8015611b9357506001600160701b03831615155b15611bfe578063ffffffff16611bbb85611bac8661207f565b6001600160e01b031690612091565b600980546001600160e01b03929092169290920201905563ffffffff8116611be684611bac8761207f565b600a80546001600160e01b0392909216929092020190555b600880546dffffffffffffffffffffffffffff19166001600160701b03888116919091176dffffffffffffffffffffffffffff60701b1916600160701b8883168102919091176001600160e01b0316600160e01b63ffffffff871602179283905560408051848416815291909304909116602082015281517f1c411e9a96e071241c2f21f7726b17ae89e3cab4c78be50e062b03a9fffbbad1929181900390910190a1505050505050565b6001600160a01b03808416600081815260026020908152604080832094871680845294825291829020859055815185815291517f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b9259281900390910190a3505050565b6001600160a01b038316600090815260016020526040902054611d2e9082611a99565b6001600160a01b038085166000908152600160205260408082209390935590841681522054611d5d90826120b6565b6001600160a01b0380841660008181526001602090815260409182902094909455805185815290519193928716927fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef92918290030190a3505050565b600080600560009054906101000a90046001600160a01b03166001600160a01b031663017e7e586040518163ffffffff1660e01b815260040160206040518083038186803b158015611e0a57600080fd5b505afa158015611e1e573d6000803e3d6000fd5b505050506040513d6020811015611e3457600080fd5b5051600b546001600160a01b038216158015945091925090611ee5578015611ee0576000611e71610e806001600160701b03888116908816611a36565b90506000611e7e83611ef9565b905080821115611edd576000611ea0611e978484611a99565b60005490611a36565b90506000611eb983611eb3866005611a36565b906120b6565b90506000818381611ec657fe5b0490508015611ed957611ed98782611f4b565b5050505b50505b611ef1565b8015611ef1576000600b555b505092915050565b60006003821115611f3c575080600160028204015b81811015611f3657809150600281828581611f2557fe5b040181611f2e57fe5b049050611f0e565b50611f46565b8115611f46575060015b919050565b600054611f5890826120b6565b60009081556001600160a01b038316815260016020526040902054611f7d90826120b6565b6001600160a01b03831660008181526001602090815260408083209490945583518581529351929391927fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef9281900390910190a35050565b6000818310611fe45781611fe6565b825b9392505050565b6001600160a01b0382166000908152600160205260409020546120109082611a99565b6001600160a01b038316600090815260016020526040812091909155546120379082611a99565b60009081556040805183815290516001600160a01b038516917fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef919081900360200190a35050565b6001600160701b0316600160701b0290565b60006001600160701b0382166001600160e01b038416816120ae57fe5b049392505050565b80820182811015610b2f576040805162461bcd60e51b815260206004820152601460248201527364732d6d6174682d6164642d6f766572666c6f7760601b604482015290519081900360640190fdfe506f636b6574537761703a20494e53554646494349454e545f494e5055545f414d4f554e54506f636b6574537761703a20494e53554646494349454e545f4c49515549444954595f4d494e544544506f636b6574537761703a20494e53554646494349454e545f4c4951554944495459506f636b6574537761703a20494e53554646494349454e545f4f55545055545f414d4f554e54506f636b6574537761703a20494e53554646494349454e545f4c49515549444954595f4255524e4544a2646970667358221220adfdf90b811005541391d1996cb24b7afb1cfdf89e9352de45e3c14b341b284164736f6c634300060c0033")}`)

        await Promise.all([
            ERC20.new(),
            ERC20.new(),
            ERC20.new(),
            PocketSwapFactory.new(accounts[0])
        ]).then(([a, b, c, d]) => [token_1, token_2, WETH, factory] = [a, b, c, d])
            .then(([a, b, c, d]) => console.log(`Token1:${a.address}\nToken2:${b.address}\nWETH:${c.address}\nfactory:${d.address}`))
            .then(() => PocketSwapRouter.new(factory.address, WETH.address))
            .then(a => router = a)
            .then(a => console.log('Router: ', a.address))
            .then(() => factory.createPair(token_1.address, token_2.address))
            .then(() => factory.getPair(token_1.address, token_2.address))
            .then(a => PocketSwapPair.at(a))
            .then(p => pair = p)
            .then(() => console.log('Pair address: ', pair.address))
        // .then(() => console.log(token_1, token_2, WETH, factory, router, pair))
    })

    it("0.3% fees to LP", async () => {
        await factory.setFeeTo('0x0000000000000000000000000000000000000000')

        await token_1.mint(accounts[0], BigInt(1e24).toString(), {from: accounts[0]})
        await token_2.mint(accounts[0], BigInt(1e24).toString(), {from: accounts[0]})
        await token_1.approve(router.address, BigInt(1e24).toString(), {from: accounts[0]})
        await token_2.approve(router.address, BigInt(1e24).toString(), {from: accounts[0]})

        await token_1.mint(accounts[2], BigInt(1e24).toString(), {from: accounts[2]})
        await token_2.mint(accounts[2], BigInt(1e24).toString(), {from: accounts[2]})
        await token_1.approve(router.address, BigInt(1e24).toString(), {from: accounts[2]})
        await token_2.approve(router.address, BigInt(1e24).toString(), {from: accounts[2]})

        await pair.approve(router.address, BigInt(1e24).toString(), {from: accounts[0]})

        await token_1.mint(accounts[1], BigInt(1e20).toString(), {from: accounts[1]})
        await token_1.approve(router.address, BigInt(1e20).toString(), {from: accounts[1]})

        await router.addLiquidity({
            token0: token_1.address,
            token1: token_2.address,
            recipient: accounts[0],
            amount0Desired: BigInt(1e24).toString(),
            amount1Desired: BigInt(1e24).toString(),
            amount0Min: BigInt(1e24).toString(),
            amount1Min: BigInt(1e24).toString(),
            deadline: deadline(),
        }, {from: accounts[0]})
        await router.addLiquidity({
            token0: token_1.address,
            token1: token_2.address,
            recipient: accounts[2],
            amount0Desired: BigInt(1e24).toString(),
            amount1Desired: BigInt(1e24).toString(),
            amount0Min: BigInt(1e24).toString(),
            amount1Min: BigInt(1e24).toString(),
            deadline: deadline(),
        }, {from: accounts[2]})

        let acc0LiquidityBalance = await pair.balanceOf(accounts[0])
        assert.equal(acc0LiquidityBalance, Math.sqrt(1e24 * 1e24), 'Liquidity Balance')

        const out = await router.getAmountsOut(BigInt(1e20).toString(), [token_1.address, token_2.address]);
        const outRef = out[1]

        // assert.equal(outRef.toString(), "99700000000000000000", 'correct exchange - 0.3%')

        const wasToken1 = await token_1.balanceOf(accounts[1])
        const wasToken2 = await token_2.balanceOf(accounts[2])

        await router.swap({
            tokenIn: token_1.address,
            tokenOut: token_2.address,
            recipient: accounts[1],
            deadline: deadline(),
            amountIn: BigInt(1e20).toString(),
            amountOutMinimum: BigInt(1e10).toString(),
        }, {from: accounts[1]})

        const nowToken1 = await token_1.balanceOf(accounts[1])
        const nowToken2 = await token_2.balanceOf(accounts[2])

        assert.equal(wasToken1-nowToken1, BigInt(1e20), "Token1 spent: 1e20")
        assert.equal(nowToken2-wasToken2, BigInt(1e18), "Token2 received: 1e18")

        await router.removeLiquidity({
            tokenA: token_1.address,
            tokenB: token_2.address,
            liquidity: acc0LiquidityBalance,
            amountAMin: "0",
            amountBMin: "0",
            recipient: accounts[0],
            deadline: deadline(),
        }, {from: accounts[0]})

        let acc0Balance1 = await token_1.balanceOf(accounts[0]);
        let acc0Balance2 = await token_2.balanceOf(accounts[0]);

        //      assert.equal(acc0Balance1.toString(), "10099999999999999996806", "Token1: 0.3% Fee to LP")
        assert.equal(acc0Balance1.toString(), "1010030000000000000000000", "Token1: 0.3% Fee to LP")
        assert.equal(acc0Balance2.toString(), "1000000000000000000000", "Token2: 0.3% Fee to LP")
    })
})

////
//
// LP1: 10_000 ether
// LP2: 1_000 ether
// ---
// + LP1: +100 ether
// - LP2: -99.7 ether
// + LP1: +0.3 ether
// ---
// LP1: 10_100.3 ether
// LP2: 900.3 ether
// ---
// LP1:
//
////
