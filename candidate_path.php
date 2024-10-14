
<?php include ('head.php');?>

<body>

    <div id="wrapper">

      
              <?php include ('view_banner.php');?>
       
        <div id="page-wrapper">

    <heading class="menu-select">
            <center>
                <select onchange = "page(this.value)">
                <option disabled selected>Select Candidate Group</option>
                <option value = "candidates/pres.php">President</option>
                <option value = "candidates/vp.php">Vice President</option>
                <option value = "candidates/ua.php">Secretary</option>
				<option value = "candidates/tr.php">Treasurer</option>
                <option value = "candidates/vp">Treasurer</option>
				<option value = "candidates/vp">P.R.O.</option>
                <option value = "candidates/vp">First Year Representative</option>
                <option value = "candidates/vp">Second Year Representative</option>
                <option value = "candidates/vp">Third Year Representative</option>
                <option value = "candidates/vp">Fourth Year Representative</option>
                </select>
            </center>

    </heading> 
        </div>
        <!-- /#page-wrapper -->
</div>
        <!-- /#page-wrapper -->
		</div>
        <!-- /#page-wrapper -->
		</div>
        <!-- /#page-wrapper -->
    </div>
    <!-- /#wrapper -->
    <?php    
        include ('footer.php');
        ?>

    <script>
    function page (src){
        window.location=src;
    }
    </script>

</body>

</html>

